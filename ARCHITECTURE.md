This backend follows a strict layered architecture designed to:

Keep business logic framework-agnostic

Isolate Encore-specific concerns

Enable future migration to Express (Node) or Go without rewriting core logic

Maintain long-term correctness and testability

The architecture intentionally separates transport/adapters from business logic.

Directory Structure
backend/
├── auth/
│   ├── handler.ts          # Encore adapter (auth handler)
│   ├── login.ts            # Encore adapter
│
├── menu/
│   ├── list.ts             # Encore adapter
│
├── order/
│   ├── create.ts           # Encore adapter
│   ├── webhook.ts          # Encore adapter
│
├── core/
│   ├── auth/
│   │   ├── auth_service.ts
│   │   └── login_service.ts
│   │
│   ├── menu/
│   │   └── service.ts
│   │
│   ├── order/
│   │   ├── create_service.ts
│   │   └── webhook_service.ts
│
├── db.ts                   # Database access
├── events/                 # Domain events (Encore topics)
└── ...

Layer Responsibilities
1. Adapter Layer (backend/** except core/)

Purpose:
Handle transport, framework, and infrastructure concerns.

Responsibilities:

Define HTTP routes and methods

Parse headers, cookies, and request payloads

Read secrets via encore.dev/config

Handle authentication wiring

Convert framework-specific types into plain values

Call core services

Allowed imports:

encore.dev/api

encore.dev/auth

encore.dev/config

encore.dev/*

Must NOT:

Contain business logic

Perform domain decisions

Duplicate logic already in core

Adapters should be thin and boring.

2. Core Layer (backend/core/**)

Purpose:
Contain all business logic.

Responsibilities:

Business rules and validations

Database queries

Domain workflows

Event publication

Data transformations

Strict rules:

❌ NO imports from encore.dev/*

❌ NO HTTP, headers, cookies, or framework types

❌ NO direct secret access

✅ Accept only plain data (strings, numbers, objects)

✅ Return plain values or throw domain-level errors

This layer must be portable to:

Express

Fastify

Go

Background workers

Tests

Error Handling Strategy

Core services throw domain-level errors

Adapters translate domain errors to:

APIError

HTTP responses

Auth failures

This prevents framework lock-in inside business logic.

Secrets & Configuration

Secrets are read only in adapters

Secrets are passed explicitly into core services as parameters

Example:

// adapter
const secretKey = secret("PaystackSecretKey")();
handlePaystackWebhook({ ..., paystackSecret: secretKey });

// core
handlePaystackWebhook({ paystackSecret: string });


This makes core services:

Testable

Portable

Deterministic

Database Access

Core services may access db

SQL must be preserved exactly during refactors

Adapters must never query the database

Adding a New Endpoint (Required Process)

Create a core service in backend/core/<domain>/

Put all logic in the service

Create a thin adapter in backend/<domain>/

Adapter responsibilities:

Input parsing

Secret retrieval

Auth wiring

Calling the core service

If logic appears in an adapter, the design is wrong.

Migration Strategy (Future)
Express (Node)

Replace adapters with Express route handlers

Reuse backend/core/** unchanged

Go

Re-implement adapters in Go

Port core logic incrementally or via shared contracts

Domain boundaries are already defined

Non-Negotiable Rules

backend/core/** must remain Encore-free

Adapters must stay thin

Business logic duplication is forbidden

Any violation must be refactored immediately

Why This Architecture Exists

This project is:

More than an MVP

A portfolio-grade system

A foundation for future production deployment

This structure ensures:

Maintainability

Scalability

Migration safety

Professional engineering standards

Final Note

If a future change makes you question where code should live, the answer is:

If it decides what happens, it belongs in core.
If it decides how it is called, it belongs in an adapter.

