# Documentation

This directory contains the technical documentation for SnapChecker. Each document focuses on a specific aspect of the system to avoid duplicated information and to provide a clear reference for developers, system administrators, and project maintainers.

For a general introduction to the project, begin with the repository's main **README.md**.

---

## Documentation Structure

| Document                    | Purpose                                                                                                                        | Intended Audience                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **DEPLOYMENT.md**           | Documents the deployment process, infrastructure, environment configuration, and production setup.                             | System Administrators, Project Maintainers |
| **ARCHITECTURE.md**         | Explains the overall system architecture, application design, and component interactions.                                      | Developers                                 |
| **DATABASE.md**             | Describes the database schema, relationships, and data model used throughout the application.                                  | Backend Developers                         |
| **API.md**                  | Provides a reference for the backend REST API endpoints, request formats, authentication requirements, and expected responses. | Frontend & Backend Developers              |
| **PRODUCTION_CHECKLIST.md** | Documents the production deployment verification process and operational checklist used before releasing the system.           | Project Maintainers                        |

---

## Recommended Reading Order

Different readers often require different information. The following reading paths are recommended depending on the intended purpose.

### New Developer

1. Repository **README.md**
2. ARCHITECTURE.md
3. DATABASE.md
4. API.md
5. DEPLOYMENT.md

### System Administrator

1. Repository **README.md**
2. DEPLOYMENT.md
3. PRODUCTION_CHECKLIST.md

### Project Maintainer

1. Repository **README.md**
2. ARCHITECTURE.md
3. DEPLOYMENT.md
4. DATABASE.md
5. API.md
6. PRODUCTION_CHECKLIST.md

---

## Documentation Principles

The documentation within this directory follows several guiding principles:

- **Single Responsibility** — Each document covers a single topic to minimize duplicated information.
- **Production-Oriented** — Documentation reflects the deployed production environment rather than development experiments.
- **Maintainability** — Documents describe architectural decisions and operational procedures instead of implementation tutorials.
- **Accuracy** — Documentation is based on the current implementation of SnapChecker and should be updated whenever significant architectural or deployment changes are introduced.

---

## Related Documentation

- **README.md** — Project overview, feature summary, repository structure, and quick start information.
