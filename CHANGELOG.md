# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2022-02-09

Initial Databricks integration

- Ingest new entity `tfe_user`
- Ingest new entity `tfe_team`
- Ingest new entity `tfe_account`
- Ingest new entity `tfe_workspace`
- Ingest new entity `tfe_organization`
- Ingest new entity `tfe_entitlement_set`
- Ingest new entity `tfe_workspace_resource`

- Build new relationship `tfe_account_has_organization`
- Build new relationship `tfe_organization_has_entitlement_set`
- Build new relationship `tfe_organization_has_team`
- Build new relationship `tfe_organization_has_user`
- Build new relationship `tfe_organization_has_workspace`
- Build new relationship `tfe_organization_has_workspace_resource`
