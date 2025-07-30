# Claude Context - Nebby Neighbor

## I/O

This project uses `gh` CLI for GitHub operations and repository management.

We plan to use the Playwright MCP for web actions including visual testing, clicking interactions, and screenshot/PDF generation during development and testing phases.

**Playwright MCP Fix:** If you encounter "Browser is already in use" errors, use `npx -y @playwright/mcp@v0.0.31` to install the previous version which resolves the issue.

For mobile testing, use `npm run dev -- --host` to expose the development server to the local network. The server is configured with `allowedHosts: ['wills-macbook-pro-6.local']` for Will's phone access.

## For Will

**Development commands:**
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production (outputs to dist/)
- `npm run preview` - Preview production build locally

**Project structure:**
- `docs/development/` - Development artifacts, screenshots, and issue documentation