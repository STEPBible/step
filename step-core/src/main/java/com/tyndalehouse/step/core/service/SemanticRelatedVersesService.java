package com.tyndalehouse.step.core.service;

import java.util.List;

public interface SemanticRelatedVersesService {
    /** Returns ranked semantically-related NRSV verse OSIS refs for an NRSV input ref.
     *  Returns empty list if the ref is not in the dataset.
     *
     *  CONTRACT: input MUST already be in NRSV versification. The dataset is
     *  NRSV-keyed by construction. Callers are responsible for inbound
     *  (user-v11n -> NRSV) and outbound (NRSV -> user-v11n) verse mapping.
     *  This service has no JSword dependency. */
    List<String> getRelatedNrsvRefs(String nrsvOsisRef);
}
