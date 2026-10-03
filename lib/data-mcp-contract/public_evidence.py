"""Public Evidence Bundle v1 producer contract.

The bundle is the portable seam between Healthcare Data MCP acquisition and a
consumer such as Healthcare Toolkit. It carries observations, healthcare
identities, canonical receipts, and cache-artifact lineage without granting a
consumer access to local caches or MCP runtime state.
"""

from __future__ import annotations

import hashlib
import json
import math
from datetime import date
from pathlib import PureWindowsPath
from typing import Literal, Self

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, GetJsonSchemaHandler, JsonValue, model_validator
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema

PUBLIC_EVIDENCE_BUNDLE_SCHEMA_VERSION = "ushso.public-evidence-bundle.v1"
SHA256_PATTERN = r"^sha256:[0-9a-f]{64}$"


class ContractModel(BaseModel):
    """Strict JSON contract base shared by v1 evidence models."""

    model_config = ConfigDict(extra="forbid")


class ProducerIdentity(ContractModel):
    repo: Literal["healthcare-data-mcp"] = "healthcare-data-mcp"
    version: str = Field(min_length=1)
    commit: str = Field(min_length=40, max_length=40, pattern=r"^[0-9a-f]{40}$")


class EvidenceRequest(ContractModel):
    workflow: str = Field(min_length=1)
    parameters: dict[str, JsonValue] = Field(default_factory=dict)


class EvidenceScope(ContractModel):
    systems: list[str] = Field(min_length=1)
    market: dict[str, JsonValue]
    service_line: str | None = None
    periods: list[str] = Field(min_length=1)


class CacheArtifactLineage(ContractModel):
    artifact_id: str = Field(min_length=1)
    checksum_sha256: str = Field(pattern=SHA256_PATTERN)
    media_type: str = Field(min_length=1)
    uri: str = Field(min_length=1)
    cache_run_id: str = Field(min_length=1)
    connector: str = Field(min_length=1)
    connector_version: str = Field(min_length=1)
    parser_version: str = Field(min_length=1)
    schema_fingerprint: str = Field(min_length=1)

    @model_validator(mode="after")
    def reject_absolute_local_path_as_locator(self) -> Self:
        windows_path = PureWindowsPath(self.uri)
        if self.uri.startswith(("/", "\\")) or self.uri.casefold().startswith("file:") or windows_path.drive:
            raise ValueError("cache artifact uri must be portable and cannot be an absolute local path")
        return self


class EvidenceReceiptV1(ContractModel):
    receipt_id: str = Field(min_length=1)
    source_name: str = Field(min_length=1)
    source_url: str = Field(min_length=1)
    dataset_id: str = Field(min_length=1)
    source_period: str = Field(min_length=1)
    landing_page: str = Field(min_length=1)
    retrieved_at: AwareDatetime
    source_modified: AwareDatetime | None = None
    cache_status: str = Field(min_length=1)
    cache_freshness: str = Field(min_length=1)
    entity_scope: str = Field(min_length=1)
    query: JsonValue
    cache_key: str = Field(min_length=1)
    match_basis: str = Field(min_length=1)
    confidence: str = Field(min_length=1)
    caveat: str
    next_step: str = Field(min_length=1)
    acquisition_method: str = Field(min_length=1)
    rights_classification: Literal[
        "public_domain", "public_use_terms", "restricted_publication", "unknown_review_required"
    ]
    row_locator: str = Field(min_length=1)
    artifact: CacheArtifactLineage
    parent_receipt_ids: list[str] = Field(default_factory=list)


class EvidenceSourceV1(ContractModel):
    source_id: str = Field(min_length=1)
    registry_id: str = Field(min_length=1)
    registry_version: str = Field(min_length=1)
    receipt: EvidenceReceiptV1
    content_checksum: str = Field(pattern=SHA256_PATTERN)
    access_rights: Literal["public_domain", "public_use_terms", "restricted_publication", "unknown_review_required"]

    @model_validator(mode="after")
    def rights_match_receipt(self) -> Self:
        if self.access_rights != self.receipt.rights_classification:
            raise ValueError("source access_rights must match its receipt")
        return self


class SourceAliasV1(ContractModel):
    source_name: str
    source_url: str = ""
    name: str = ""
    identifier: str = ""
    identifier_type: str = ""
    retrieved_at: AwareDatetime | None = None


class MatchDecisionV1(ContractModel):
    basis: str
    confidence: str
    decided_at: AwareDatetime | None = None
    notes: str = ""


class HealthcareEntityV1(ContractModel):
    entity_id: str = Field(min_length=1)
    canonical_name: str = Field(min_length=1)
    entity_type: str = Field(min_length=1)
    ccn: str = ""
    npi: str = ""
    pecos_enrollment_id: str = ""
    ahrq_system_id: str = ""
    owner_id: str = ""
    address: str = ""
    zip_code: str = ""
    aliases: list[SourceAliasV1] = Field(default_factory=list)
    match_decisions: list[MatchDecisionV1] = Field(default_factory=list)
    conflicts: list[dict[str, str]] = Field(default_factory=list)
    unresolved_identifiers: list[dict[str, str]] = Field(default_factory=list)


class EvidencePeriod(ContractModel):
    start: date | None = None
    end: date | None = None
    label: str = Field(min_length=1)

    @model_validator(mode="after")
    def dates_are_ordered(self) -> Self:
        if self.start is not None and self.end is not None and self.end < self.start:
            raise ValueError("evidence period end cannot precede start")
        return self


class EvidenceObservationV1(ContractModel):
    observation_id: str = Field(min_length=1)
    measure_id: str = Field(min_length=1)
    value_type: Literal["integer", "number", "string", "boolean"]
    value: JsonValue
    unit: str = Field(min_length=1)
    period: EvidencePeriod
    denominator_scope: str = Field(min_length=1)
    entity_ref: str = Field(min_length=1)
    receipt_refs: list[str] = Field(min_length=1)
    derivation_class: Literal["source_reported", "normalized", "modeled_input"]
    caveat: str
    dependency_cluster_ids: list[str] = Field(min_length=1)

    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        core_schema: CoreSchema,
        handler: GetJsonSchemaHandler,
    ) -> JsonSchemaValue:
        schema = handler(core_schema)
        schema["allOf"] = [
            {
                "if": {"properties": {"value_type": {"const": value_type}}, "required": ["value_type"]},
                "then": {"properties": {"value": {"type": json_type}}},
            }
            for value_type, json_type in (
                ("integer", "integer"),
                ("number", "number"),
                ("string", "string"),
                ("boolean", "boolean"),
            )
        ]
        return schema

    @model_validator(mode="after")
    def value_matches_declared_type(self) -> Self:
        value = self.value
        if self.value_type == "integer" and isinstance(value, float) and math.isfinite(value) and value.is_integer():
            self.value = int(value)
            value = self.value
        matches = {
            "integer": isinstance(value, int) and not isinstance(value, bool),
            "number": isinstance(value, (int, float)) and not isinstance(value, bool),
            "string": isinstance(value, str),
            "boolean": isinstance(value, bool),
        }
        if not matches[self.value_type]:
            raise ValueError("observation value must match value_type")
        if self.value_type == "number" and isinstance(value, float) and not math.isfinite(value):
            raise ValueError("numeric observation value must be finite")
        return self


class EvidenceCoverageV1(ContractModel):
    coverage_id: str = Field(min_length=1)
    entity_ref: str = Field(min_length=1)
    measure_id: str = Field(min_length=1)
    status: Literal[
        "populated",
        "not_yet_researched",
        "unavailable_public",
        "not_applicable",
        "blocked_source_conflict",
    ]
    observation_refs: list[str] = Field(default_factory=list)
    reason: str = Field(min_length=1)

    @model_validator(mode="after")
    def references_match_status(self) -> Self:
        if self.status == "populated" and not self.observation_refs:
            raise ValueError("populated coverage requires an observation reference")
        if self.status != "populated" and self.observation_refs:
            raise ValueError("missingness coverage cannot reference populated observations")
        return self


class EvidenceConflictV1(ContractModel):
    conflict_id: str = Field(min_length=1)
    conflict_type: str = Field(min_length=1)
    entity_refs: list[str] = Field(default_factory=list)
    observation_refs: list[str] = Field(default_factory=list)
    receipt_refs: list[str] = Field(default_factory=list)
    status: Literal["open", "accepted_with_rationale", "resolved"]
    rationale: str = Field(min_length=1)


class PublicEvidenceBundleInput(ContractModel):
    bundle_id: str = Field(min_length=1)
    producer: ProducerIdentity
    created_at: AwareDatetime
    request: EvidenceRequest
    scope: EvidenceScope
    entities: list[HealthcareEntityV1] = Field(min_length=1)
    observations: list[EvidenceObservationV1]
    sources: list[EvidenceSourceV1] = Field(min_length=1)
    coverage: list[EvidenceCoverageV1] = Field(min_length=1)
    conflicts: list[EvidenceConflictV1] = Field(default_factory=list)
    input_artifacts: list[CacheArtifactLineage] = Field(min_length=1)


class PublicEvidenceBundle(PublicEvidenceBundleInput):
    schema_version: Literal[PUBLIC_EVIDENCE_BUNDLE_SCHEMA_VERSION] = PUBLIC_EVIDENCE_BUNDLE_SCHEMA_VERSION
    bundle_sha256: str = Field(pattern=SHA256_PATTERN)

    @model_validator(mode="after")
    def validate_graph_and_hash(self) -> Self:
        _validate_unique("entity_id", [item.entity_id for item in self.entities])
        _validate_unique("observation_id", [item.observation_id for item in self.observations])
        _validate_unique("source_id", [item.source_id for item in self.sources])
        _validate_unique("receipt_id", [item.receipt.receipt_id for item in self.sources])
        _validate_unique("cache artifact_id", [item.artifact_id for item in self.input_artifacts])
        _validate_unique("coverage_id", [item.coverage_id for item in self.coverage])
        _validate_unique("conflict_id", [item.conflict_id for item in self.conflicts])
        entity_ids = {item.entity_id for item in self.entities}
        observations = {item.observation_id: item for item in self.observations}
        observation_ids = set(observations)
        receipt_ids = {item.receipt.receipt_id for item in self.sources}
        artifacts = {item.artifact_id: item for item in self.input_artifacts}
        artifact_ids = set(artifacts)
        for observation in self.observations:
            _require_refs("observation entity", [observation.entity_ref], entity_ids)
            _require_refs("observation receipt", observation.receipt_refs, receipt_ids)
        for coverage in self.coverage:
            _require_refs("coverage entity", [coverage.entity_ref], entity_ids)
            _require_refs("coverage observation", coverage.observation_refs, observation_ids)
            for observation_ref in coverage.observation_refs:
                observation = observations[observation_ref]
                if observation.entity_ref != coverage.entity_ref or observation.measure_id != coverage.measure_id:
                    raise ValueError("coverage observation must match coverage entity_ref and measure_id")
        for source in self.sources:
            _require_refs("source cache artifact", [source.receipt.artifact.artifact_id], artifact_ids)
            if source.receipt.artifact != artifacts[source.receipt.artifact.artifact_id]:
                raise ValueError("source receipt artifact must match input artifact lineage")
            _require_refs("parent receipt", source.receipt.parent_receipt_ids, receipt_ids)
        for conflict in self.conflicts:
            _require_refs("conflict entity", conflict.entity_refs, entity_ids)
            _require_refs("conflict observation", conflict.observation_refs, observation_ids)
            _require_refs("conflict receipt", conflict.receipt_refs, receipt_ids)
        expected = canonical_sha256(self.model_dump(mode="json", exclude={"bundle_sha256"}))
        if self.bundle_sha256 != expected:
            raise ValueError("bundle_sha256 does not match canonical bundle content")
        return self


def canonical_sha256(value: object) -> str:
    """Hash canonical UTF-8 JSON for portable contract identity."""

    encoded = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()}"


def build_public_evidence_bundle(value: PublicEvidenceBundleInput) -> PublicEvidenceBundle:
    """Build and graph-validate a content-addressed Public Evidence Bundle."""

    body = value.model_dump(mode="json")
    return PublicEvidenceBundle.model_validate(
        {
            "schema_version": PUBLIC_EVIDENCE_BUNDLE_SCHEMA_VERSION,
            **body,
            "bundle_sha256": canonical_sha256({"schema_version": PUBLIC_EVIDENCE_BUNDLE_SCHEMA_VERSION, **body}),
        }
    )


def _validate_unique(label: str, values: list[str]) -> None:
    if len(values) != len(set(values)):
        raise ValueError(f"duplicate {label}")


def _require_refs(label: str, refs: list[str], allowed: set[str]) -> None:
    unknown = sorted(set(refs) - allowed)
    if unknown:
        raise ValueError(f"unknown {label} reference(s): {', '.join(unknown)}")


__all__ = [
    "PUBLIC_EVIDENCE_BUNDLE_SCHEMA_VERSION",
    "CacheArtifactLineage",
    "EvidenceConflictV1",
    "EvidenceCoverageV1",
    "EvidenceObservationV1",
    "EvidenceReceiptV1",
    "EvidenceRequest",
    "EvidenceScope",
    "EvidenceSourceV1",
    "HealthcareEntityV1",
    "ProducerIdentity",
    "PublicEvidenceBundle",
    "PublicEvidenceBundleInput",
    "build_public_evidence_bundle",
    "canonical_sha256",
]
