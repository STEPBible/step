#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#***************************************************************************
#                                  _   _ ____  _
#  Project                     ___| | | |  _ \| |
#                             / __| | | | |_) | |
#                            | (__| |_| |  _ <| |___
#                             \___|\___/|_| \_\_____|
#
# Copyright (C) Daniel Stenberg, <daniel@haxx.se>, et al.
#
# This software is licensed as described in the file COPYING, which
# you should have received as part of this distribution. The terms
# are also available at https://curl.se/docs/copyright.html.
#
# You may opt to use, copy, modify, merge, publish, distribute and/or sell
# copies of the Software, and permit persons to whom the Software is
# furnished to do so, under the terms of the COPYING file.
#
# This software is distributed on an "AS IS" basis, WITHOUT WARRANTY OF ANY
# KIND, either express or implied.
#
# SPDX-License-Identifier: curl
#
###########################################################################
#
import filecmp
import logging
import os
import re
import pytest

from testenv import Env, CurlClient, ExecResult


log = logging.getLogger(__name__)


class TestProxy:

    @pytest.fixture(autouse=True, scope='class')
    def _class_scope(self, env, httpd, nghttpx_fwd):
        push_dir = os.path.join(httpd.docs_dir, 'push')
        if not os.path.exists(push_dir):
            os.makedirs(push_dir)
        if env.have_nghttpx():
            nghttpx_fwd.start_if_needed()
        env.make_data_file(indir=env.gen_dir, fname="data-100k", fsize=100*1024)
        env.make_data_file(indir=env.gen_dir, fname="data-10m", fsize=10*1024*1024)
        httpd.clear_extra_configs()
        httpd.reload()

    def set_tunnel_proto(self, proto):
        if proto == 'h2':
            os.environ['CURL_PROXY_TUNNEL_H2'] = '1'
            return 'HTTP/2'
        else:
            os.environ.pop('CURL_PROXY_TUNNEL_H2', None)
            return 'HTTP/1.1'

    def get_tunnel_proto_used(self, r: ExecResult):
        for l in r.trace_lines:
            m = re.match(r'.* CONNECT tunnel: (\S+) negotiated$', l)
            if m:
                return m.group(1)
        assert False, f'tunnel protocol not found in:\n{"".join(r.trace_lines)}'
        return None

    # download via http: proxy (no tunnel)
    def test_10_01_proxy_http(self, env: Env, httpd, repeat):
        curl = CurlClient(env=env)
        url = f'http://localhost:{env.http_port}/data.json'
        r = curl.http_download(urls=[url], alpn_proto='http/1.1', with_stats=True,
                               extra_args=[
                                 '--proxy', f'http://{env.proxy_domain}:{env.proxy_port}/',
                                 '--resolve', f'{env.proxy_domain}:{env.proxy_port}:127.0.0.1',
                               ])
        r.check_response(count=1, http_status=200)

    # download via https: proxy (no tunnel)
    @pytest.mark.skipif(condition=not Env.curl_has_feature('HTTPS-proxy'),
                        reason='curl lacks HTTPS-proxy support')
    @pytest.mark.skipif(condition=not Env.have_nghttpx(), reason="no nghttpx available")
    def test_10_02_proxy_https(self, env: Env, httpd, nghttpx_fwd, repeat):
        curl = CurlClient(env=env)
        url = f'http://localhost:{env.http_port}/data.json'
        r = curl.http_download(urls=[url], alpn_proto='http/1.1', with_stats=True,
                               extra_args=[
                                 '--proxy', f'https://{env.proxy_domain}:{env.proxys_port}/',
                                 '--resolve', f'{env.proxy_domain}:{env.proxys_port}:127.0.0.1',
                                 '--proxy-cacert', env.ca.cert_file,
                               ])
        r.check_response(count=1, http_status=200)

    # download http: via http: proxytunnel
    def test_10_03_proxytunnel_http(self, env: Env, httpd, repeat):
        curl = CurlClient(env=env)
        url = f'http://localhost:{env.http_port}/data.json'
        r = curl.http_download(urls=[url], alpn_proto='http/1.1', with_stats=True,
                               extra_args=[
                                 '--proxytunnel',
                                 '--proxy', f'http://{env.proxy_domain}:{env.proxy_port}/',
                                 '--resolve', f'{env.proxy_domain}:{env.proxy_port}:127.0.0.1',
                               ])
        r.check_response(count=1, http_status=200)

    # download http: via https: proxytunnel
    @pytest.mark.skipif(condition=not Env.curl_has_feature('HTTPS-proxy'),
                        reason='curl lacks HTTPS-proxy support')
    @pytest.mark.skipif(condition=not Env.have_nghttpx(), reason="no nghttpx available")
    def test_10_04_proxy_https(self, env: Env, httpd, nghttpx_fwd, repeat):
        curl = CurlClient(env=env)
        url = f'http://localhost:{env.http_port}/data.json'
        r = curl.http_download(urls=[url], alpn_proto='http/1.1', with_stats=True,
                               extra_args=[
                                 '--proxytunnel',
                                 '--proxy', f'https://{env.proxy_domain}:{env.pts_port()}/',
                                 '--resolve', f'{env.proxy_domain}:{env.pts_port()}:127.0.0.1',
                                 '--proxy-cacert', env.ca.cert_file,
                               ])
        r.check_response(count=1, http_status=200)

    # download https: with proto via http: proxytunnel
    @pytest.mark.parametrize("proto", ['http/1.1', 'h2'])
    @pytest.mark.skipif(condition=not Env.have_ssl_curl(), reason=f"curl without SSL")
    def test_10_05_proxytunnel_http(self, env: Env, httpd, proto, repeat):
        curl = CurlClient(env=env)
        url = f'https://localhost:{env.https_port}/data.json'
        r = curl.http_download(urls=[url], alpn_proto=proto, with_stats=True,
                               with_headers=True,
                               extra_args=[
                                 '--proxytunnel',
                                 '--proxy', f'http://{env.proxy_domain}:{env.proxy_port}/',
                                 '--resolve', f'{env.proxy_domain}:{env.proxy_port}:127.0.0.1',
                               ])
        r.check_response(count=1, http_status=200,
                         protocol='HTTP/2' if proto == 'h2' else 'HTTP/1.1')

    # download https: with proto via https: proxytunnel
    @pytest.mark.skipif(condition=not Env.curl_has_feature('HTTPS-proxy'),
                        reason='curl lacks HTTPS-proxy support')
    @pytest.mark.parametrize("proto", ['http/1.1', 'h2'])
    @pytest.mark.parametrize("tunnel", ['http/1.1', 'h2'])
    @pytest.mark.skipif(condition=not Env.have_nghttpx(), reason="no nghttpx available")
    def test_10_06_proxytunnel_https(self, env: Env, httpd, nghttpx_fwd, proto, tunnel, repeat):
        if tunnel == 'h2' and not env.curl_uses_lib('nghttp2'):
            pytest.skip('only supported with nghttp2')
        exp_tunnel_proto = self.set_tunnel_proto(tunnel)
        curl = CurlClient(env=env)
        url = f'https://localhost:{env.https_port}/data.json?[0-0]'
        r = curl.http_download(urls=[url], alpn_proto=proto, with_stats=True,
                               with_headers=True,
                               extra_args=[
                                 '--proxytunnel',
                                 '--proxy', f'https://{env.proxy_domain}:{env.pts_port(tunnel)}/',
                                 '--resolve', f'{env.proxy_domain}:{env.pts_port(tunnel)}:127.0.0.1',
                                 '--proxy-cacert', env.ca.cert_file,
                               ])
        r.check_response(count=1, http_status=200,
                         protocol='HTTP/2' if proto == 'h2' else 'HTTP/1.1')
        assert self.get_tunnel_proto_used(r) == exp_tunnel_proto
        srcfile = os.path.join(httpd.docs_dir, 'data.json')
        dfile = curl.download_file(0)
        assert filecmp.cmp(srcfile, dfile, shallow=False)

    # download many https: with proto via https: proxytunnel
    @pytest.mark.skipif(condition=not Env.have_ssl_curl(), reason=f"curl without SSL")
    @pytest.mark.parametrize("proto", ['http/1.1', 'h2'])
    @pytest.mark.parametrize("tunnel", ['http/1.1', 'h2'])
    @pytest.mark.parametrize("fname, fcount", [
        ['data.json', 100],
        ['data-100k', 20],
        ['data-1m', 5]
    ])
    @pytest.mark.skipif(condition=not Env.have_nghttpx(), reason="no nghttpx available")
    def test_10_07_pts_down_small(self, env: Env, httpd, nghttpx_fwd, proto,
                                  tunnel, fname, fcount, repeat):
        if tunnel == 'h2' and not env.curl_uses_lib('nghttp2'):
            pytest.skip('only supported with nghttp2')
        count = fcount
        exp_tunnel_proto = self.set_tunnel_proto(tunnel)
        curl = CurlClient(env=env)
        url = f'https://localhost:{env.https_port}/{fname}?[0-{count-1}]'
        r = curl.http_download(urls=[url], alpn_proto=proto, with_stats=True,
                               with_headers=True,
                               extra_args=[
                                 '--proxytunnel',
                                 '--proxy', f'https://{env.proxy_domain}:{env.pts_port(tunnel)}/',
                                 '--resolve', f'{env.proxy_domain}:{env.pts_port(tunnel)}:127.0.0.1',
                                 '--proxy-cacert', env.ca.cert_file,
                               ])
        r.check_response(count=count, http_status=200,
                         protocol='HTTP/2' if proto == 'h2' else 'HTTP/1.1')
        assert self.get_tunnel_proto_used(r) == exp_tunnel_proto
        srcfile = os.path.join(httpd.docs_dir, fname)
        for i in range(count):
            dfile = curl.download_file(i)
            assert filecmp.cmp(srcfile, dfile, shallow=False)

    # upload many https: with proto via https: proxytunnel
    @pytest.mark.skipif(condition=not Env.have_ssl_curl(), reason=f"curl without SSL")
    @pytest.mark.parametrize("proto", ['http/1.1', 'h2'])
    @pytest.mark.parametrize("tunnel", ['http/1.1', 'h2'])
    @pytest.mark.parametrize("fname, fcount", [
        ['data.json', 50],
        ['data-100k', 20],
        ['data-1m', 5]
    ])
    @pytest.mark.skipif(condition=not Env.have_nghttpx(), reason="no nghttpx available")
    def test_10_08_upload_seq_large(self, env: Env, httpd, nghttpx, proto,
                                    tunnel, fname, fcount, repeat):
        if tunnel == 'h2' and not env.curl_uses_lib('nghttp2'):
            pytest.skip('only supported with nghttp2')
        count = fcount
        srcfile = os.path.join(httpd.docs_dir, fname)
        exp_tunnel_proto = self.set_tunnel_proto(tunnel)
        curl = CurlClient(env=env)
        url = f'https://localhost:{env.https_port}/curltest/echo?id=[0-{count-1}]'
        r = curl.http_upload(urls=[url], data=f'@{srcfile}', alpn_proto=proto,
                             extra_args=[
                               '--proxytunnel',
                               '--proxy', f'https://{env.proxy_domain}:{env.pts_port(tunnel)}/',
                               '--resolve', f'{env.proxy_domain}:{env.pts_port(tunnel)}:127.0.0.1',
                               '--proxy-cacert', env.ca.cert_file,
                             ])
        assert self.get_tunnel_proto_used(r) == exp_tunnel_proto
        r.check_response(count=count, http_status=200)
        indata = open(srcfile).readlines()
        r.check_response(count=count, http_status=200)
        for i in range(count):
            respdata = open(curl.response_file(i)).readlines()
            assert respdata == indata

    @pytest.mark.skipif(condition=not Env.have_ssl_curl(), reason=f"curl without SSL")
    @pytest.mark.parametrize("tunnel", ['http/1.1', 'h2'])
    @pytest.mark.skipif(condition=not Env.have_nghttpx(), reason="no nghttpx available")
    def test_10_09_reuse_ser(self, env: Env, httpd, nghttpx_fwd, tunnel, repeat):
        if tunnel == 'h2' and not env.curl_uses_lib('nghttp2'):
            pytest.skip('only supported with nghttp2')
        exp_tunnel_proto = self.set_tunnel_proto(tunnel)
        curl = CurlClient(env=env)
        url1 = f'https://localhost:{env.https_port}/data.json'
        url2 = f'http://localhost:{env.http_port}/data.json'
        r = curl.http_download(urls=[url1, url2], alpn_proto='http/1.1', with_stats=True,
                               with_headers=True,
                               extra_args=[
                                 '--proxytunnel',
                                 '--proxy', f'https://{env.proxy_domain}:{env.pts_port(tunnel)}/',
                                 '--resolve', f'{env.proxy_domain}:{env.pts_port(tunnel)}:127.0.0.1',
                                 '--proxy-cacert', env.ca.cert_file,
                               ])
        r.check_response(count=2, http_status=200)
        assert self.get_tunnel_proto_used(r) == exp_tunnel_proto
        if tunnel == 'h2':
            # TODO: we would like to reuse the first connection for the
            # second URL, but this is currently not possible
            # assert r.total_connects == 1
            assert r.total_connects == 2
        else:
            assert r.total_connects == 2

