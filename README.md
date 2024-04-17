# Uno Monorepo Config Repro

This is an illustration of two problems I encountered when using unocss in a pnpm monorepo:

1. Unable to apply configuration from another non-root directory without modifying `@unocss/config`
2. Unable to use globs specified in a config file in another non-root directory, even after modifying `@unocss/config`

My use case requires building a CSS file to a static file server, using Uno configuration stored in a separate UI workspace. unocss should analyse JSX files in the UI workspace and apply any other configuration, before outputting the resulting CSS file into a subdirectory in the static server.

After trying various approaches, I looked into the code behind Uno's CLI and found that by making one small change to the code, I was able to get the desired behaviour.

This repo allows a user to set the combinations of config, build task, and code to reproduce the four outcomes described below.

## The ingredients

The main pieces of this illustration are the two build tasks in `apps/static/package.json` and the two unocss config files, `packages/ui/uno.config.js` and `packages/ui/uno.config-with-glob.js`.

The build tasks both contain references to Uno config files and to an output file, but `build` includes a glob of JSX files in `packages/ui`, whereas `build-with-config-glob` instead relies on the glob being applied via `cli.entry.patterns` in `uno.config-with-glob.js`.

The Uno config files both use `presetWebFonts` to prove that the config file has been used in the build; i.e. if there are `@font-face` declarations in the output file, the config file has been used in the build.

## Getting set up

This illustration uses pnpm in order to stay true to my use case, a monorepo using pnpm's Workspaces functionality. I've left out the workspaces configuration as it didn't add anything to the repro. This means that to get the illustration running, you need to `pnpm install` in both the `apps/static` and `packages/ui` directories.

## Running the combinations

The four combinations in this illustration are:

1. Glob in config
2. Glob in build task
3. Modified code, glob in config
4. Modified code, glob in build task

The last two cases require a minor change to the code in `@unocss/config`, which is described later.

### 1. Glob in config

In `apps/static`, run `pnpm run build-with-config-glob`, which uses `packages/ui/uno.config-with-glob.js`. You should see an error: "No glob patterns, try unocss <path/to/**/*>". This is unexpected, as there is a valid glob in the config.

### 2. Glob in build task

Run `pnpm run build` (which uses `packages/ui/uno.config.js`) and you'll see that the task ran without errors and that `apps/static/public/ui/app.css` was created.

Opening `apps/static/public/ui/app.css` reveals that the class name, `bg-yellow` from `packages/ui/components/button.jsx` was detected and used in building the CSS file. Unfortunately there are no `@font-face` declarations in the output file, which indicates that the config was not used in executing this task.

### 3. Modified code, glob in config

In this, and the following variation, we update line 44 of `@unocss/config/dist/index.mjs` from `result.config = Object.assign(defaults, result.config || inlineConfig);` to `result.config = Object.assign(defaults, result.config() || inlineConfig);`.

After making the change, run `pnpm run build-with-config-glob` and see that `apps/static/public/ui/app.css` contains `@font-face` declarations but no declaration for `.bg-yellow`. The task has used the config, but failed to include the class name from `packages/ui/components/button.jsx` as per the config-specified glob.

### 4. Modified code, glob in build task

With the change to `@unocss/config/dist/index.mjs` still in place, run `pnpm run build` and see that `apps/static/public/ui/app.css` contains `@font-face` declarations and a declaration for `.bg-yellow`.

The task has successfully combined the task-based glob (finding the class name in `button.jsx`) and `presetWebFonts` from the config.

✅ This satisfies my use case.

## Conclusion

There are two issues demonstrated in this illustration:

1. Unable to apply configuration from another non-root directory without modifying `@unocss/config`
2. Unable to use globs specified in a config file in another non-root directory, even after modifying `@unocss/config`

Ideally, I'd like to be able to define a build task like this: `unocss --config ../../packages/ui/uno.config.js --out-file public/ui/app.css`. i.e. use a config file in a another non-root directory, with the glob defined within the config file, rather than in the build task.

Modifying `@unocss/config` was just an exploratory hack in a dist file, so it's obviously not the right way to solve the problem. Even so, I'm unsure whether (even when correctly implemented) the change to `@unocss/config` would have undesirable impacts in scenarios other than my use case, so I'm certainly not recommending that specific approach.

I hope this illustration helps describe what I'm trying to achieve and the steps I took to get to the desired outcome. Hopefully it can help in either devising a change to unocss, or -- more likely -- for someone to point out what I've done wrong.

Either way, any help would be greatly appreciated.

Thanks :)

