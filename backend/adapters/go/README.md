# Go Adapter (Skeleton)

## Purpose
The Go adapter provides a lightweight HTTP interface for this project. Its responsibility is to accept HTTP requests, perform minimal request handling (parsing/validation specific to transport concerns), and delegate to the existing core layer. It contains no business logic.

## What it will expose
- HTTP endpoints only (e.g., POST/GET routes)
- No domain/business logic in the adapter
- No tight coupling to application internals beyond calling into the core layer

## Communication with the core
- The Go adapter will communicate with the existing core via HTTP calls to the framework-specific adapters (or a future core HTTP façade), not by importing core packages directly.
- This preserves clear boundaries and allows independent evolution of adapters and core.

## Business logic location
- All business logic remains in `backend/core`.
- The adapter must not implement or duplicate business rules; it should only map HTTP payloads to core calls and map core responses back to HTTP responses.

## Current state
- This is a scaffold only. `main.go` prints:
  
  ```
  Go adapter booted
  ```
  
- No routes, frameworks, or dependencies are added at this time.
