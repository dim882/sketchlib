# @dim882/sketchlib

Reusable TypeScript utilities for creative-coding sketches. Extracted from the
[Sketchbook](https://github.com/dim882/sketchbook) monorepo's old `lib/` directory into its own
repo so sketches can pin to stable versions independently.

## What's here

- `animation.ts` -- `loop`, a `requestAnimationFrame`-based render loop with an optional fps cap
  and duration

This is a deliberately small starting point. More modules will move over from Sketchbook's old
`lib/` incrementally, once this repo-split and linking setup is proven out.

## Integration with Sketchbook

This package is **not published to npm**. Sketchbook consumes it two ways, depending on whether
the lib is under active development.

### Pinned mode (default)

Most sketches depend on a tagged version via a git URL:

```jsonc
// sketchbook/sketches/my-sketch/package.json
{
  "dependencies": {
    "@dim882/sketchlib": "github:dim882/sketchlib#v1"
  }
}
```

Each sketch pins its own tag. Bumping one sketch's version never affects another.

### Dev mode (actively editing this repo)

While editing sketchlib source and needing the change to show up immediately in a running sketch,
Sketchbook's root `package.json` declares a `pnpm.overrides` entry pointing at this repo's local
path (both repos are expected to be sibling directories, e.g. under a shared
`sketchbook.workspace/`):

```jsonc
// sketchbook/package.json
{
  "pnpm": {
    "overrides": {
      "@dim882/sketchlib": "link:../sketchlib"
    }
  }
}
```

Run `pnpm install` in Sketchbook after adding or removing the override.

The override is workspace-wide: every sketch resolves to this local linked copy while it's
active, not just the one being worked on. That's fine in practice -- only one sketch is usually
under active lib development at a time, and removing the override afterward restores every
sketch's own pinned version untouched, since pinned dependencies stay declared in each sketch's
`package.json` the whole time.

`link:` was chosen over the imperative `pnpm link` command: `pnpm link` has documented
reliability bugs in pnpm v9/v10 (peer dependency duplication among them), and it leaves no trace
in `package.json`, so it's easy to forget it's active. `pnpm.overrides` is declarative and shows
up in a diff.

### Publishing a new version

1. Commit changes in this repo
2. Tag the next integer version: `git tag v2`
3. Push: `git push && git push --tags`
4. Update the consuming sketch's `package.json` to `github:dim882/sketchlib#v2`
5. `pnpm install` in Sketchbook

No npm registry, no `npm publish` step. The `prepare` script builds `dist/` automatically when
pnpm installs the git URL.

## Development

```bash
pnpm install
pnpm build
```

See `sketchbook.notes/projects/_backlog/Extract_SketchLib/Extract_Sketchlib_Architecture.md` in
the Sketchbook notes repo for the full architecture writeup.
