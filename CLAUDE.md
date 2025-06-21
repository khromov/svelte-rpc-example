# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Svelte Remote Functions example demonstrating the experimental RPC (Remote Procedure Call) feature for SvelteKit. The project showcases component-level data loading using remote functions as an alternative to traditional `load` functions.

## Development Commands

**IMPORTANT**: Never run `npm run dev` - only use `npm run build` to check for errors.

- `npm run build` - Build for production and check for errors
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript and Svelte checks
- `npm run check:watch` - Run checks in watch mode
- `npm run format` - Format code with Prettier
- `npm run lint` - Check code formatting with Prettier

## Architecture

### Experimental Features

This project uses experimental Svelte and SvelteKit features:

- **Svelte async**: Enabled via `experimental: { async: true }` in `svelte.config.js`
- **SvelteKit Remote Functions**: Enabled via `experimental: { remoteFunctions: true }`

### Remote Functions Pattern

Remote functions are defined in `*.remote.ts` files and can be imported/used directly in components:

- **Queries**: Use `query()` for data fetching operations that can be cached
- **Commands**: Use `command()` for mutations that trigger side effects
- **Optimistic Updates**: Use `.override()` method for immediate UI updates before server response

### Database Layer

Uses better-sqlite3 for persistent storage with prepared statements for performance. Database initialization and schema creation happens automatically in remote function files.

### Key Files

- `src/routes/counter.remote.ts` - Remote function definitions (queries and commands)
- `src/routes/+page.svelte` - Component consuming remote functions with async/await syntax
- `svelte.config.js` - Experimental feature flags configuration
- `db/db.sqlite` - SQLite database file

### Dependencies

- Uses a custom SvelteKit build from local tarball (`packages/sveltejs-kit-2.21.1.tgz`)
- Svelte from PR preview (`https://pkg.pr.new/svelte@15844`)
- Database operations via better-sqlite3

### This PR uses a special build of SvelteKit with new Remote Functions spec. Here are the docs for it:

## tl;dr

Remote functions are a new concept in SvelteKit that allow you to declare functions inside a `.remote.ts` file, import them inside Svelte components and call them like regular functions. On the server they work like regular functions (and can access environment variables and database clients and so on), while on the client they become wrappers around `fetch`. If you're familiar with RPC and 'server functions', this is basically our take on the concept, that addresses some of the drawbacks we've encountered with other implementations of the idea.

You can try it out soon by installing from the corresponding PR once it's out...

... and add the experimental options

```js
const config = {
	// ...

	kit: {
		// add this:
		experimental: {
			remoteFunctions: true
		}
		// ...
	},

	// we recommend using this in combination with Svelte's new async capabilities
	compilerOptions: {
		experimental: { async: true }
	}
}
```

We'll also link an example here, soon.

## Background

Today, SvelteKit's data loading is based on the concept of loaders. You declare a `load` function inside a `+page/layout(.server).ts` file, fetch the required data for the whole page in it, and retrieve the result via the `data` prop inside the sibling `+page/layout.svelte` file.

This allows for a very structured approach to data loading and works well for sites where the loaded data is used on the whole page. When that isn't so clear-cut, some drawbacks become apparent:

     * it leads to implicit coupling between what seem like disconnected files:

       * colocation suffers
       * data only needed in one corner of the page, or only under certain conditions, still needs to be put into the loader
       * deleting or refactoring code becomes harder since you need to keep in mind both where stuff is loaded and where it’s used

     * sharing data means moving its data loading up and down the layout loader tree, leading to more complexity

     * refetching data happens on a loader level, if you want it to be more granular SvelteKit can't help you

Additionally, since `load` and the resulting `data` prop are somewhat disconnected, we have to resort to very clever but somewhat weird solutions like [generating hidden types you import as `./$types`](https://svelte.dev/docs/kit/routing#$types) or even [using a TypeScript plugin to avoid having to import the types yourself](https://svelte.dev/blog/zero-config-type-safety). An approach where we can use TypeScript natively would simplify all this and make it more robust.

Lastly, apart from form actions SvelteKit doesn't give you a good way to mutate data. You can use `+server.ts` files and do fetch requests against these endpoints, but it's a lot of ceremony and you lose type safety.

### Asynchronous Svelte

A couple of weeks ago we introduced [Asynchronous Svelte](https://github.com/sveltejs/svelte/discussions/15845), a proposal to allow using `await` at the top level of Svelte components and inside the template.

This in itself is already valuable, but the way SvelteKit's data loading is architected right now you can't take full advantage of it inside SvelteKit.

## Requirements

A solution should fix these drawbacks and take advantage of Svelte's capabilities, and specifically should:

     * be secure and intuitive

     * increase colocation, moving data loading closer to where it's used

     * make loading and mutation type-safe

     * put control of granularity in the developer's hands

     * fully take advantage of asynchronous Svelte

     * be maximally efficient

An important additional requirement is that modules that can run in the client (including components) must _never_ include code that can only run on the server. A remote function must be able to safely access things like database clients and environment variables that should not (or cannot) be accessed from the client.

In practice, this means that remote functions must be declared in a separate module. Over the last few years various systems have experimented with 'server functions' declared alongside universal/client code, and we're relieved to see a growing consensus that this is a flawed approach that trades security and clarity for a modicum of convenience. You're one innocent mistake away from leaking sensitive information (such as API keys or the shape of your database), and even if tooling successfully treeshakes it away, it may remain in sourcemaps. While no framework can completely prevent you from spilling secrets, we think colocating server and client code makes it _much_ more likely.

Allowing server functions to be declared in arbitrary locations also masks the fact that they are effectively creating a publicly accessible endpoint. Even in systems that prevent server functions from being declared in client code (such as `"use server"` in React Server Components), experienced developers can be [caught out](https://x.com/trashh_dev/status/1797624304060018922). We prefer a design that emphasises the public nature of remote functions rather than the fact that they run on the server, and avoids any confusion around lexical scope.

## Design

Before we jump in we want to make clear that this does not affect `load` functions, they continue to work as is.

Remote functions are declared inside a `.remote.ts` file. You can import them inside Svelte components and call them like regular async functions. On the server you import them directly; on the client, the module is transformed into a collection of functions that request data from the server.

Today we’re introducing four types of remote function: `query`, `form`, `command` and `prerender`.

### query

Queries are for reading dynamic data from the server. They can have any number of arguments. The arguments are serialized with [devalue](https://github.com/rich-harris/devalue), which handles types like `Date` and `Map` in addition to JSON, and takes the [transport hook](https://svelte.dev/docs/kit/hooks#Universal-hooks-transport) into account.

```ts
import { query } from '$app/server';
import * as db from '$lib/server/db';

export const getLikes = query(async (id: string) = {
  const [row] = await db.sql`select likes from item where id = ${id}`;
  return row.likes;
});
```

When called during server-rendering, the result is serialized into the HTML payload so that the data isn't requested again during hydration.

```svelte
<script
  import { getLikes } from './data.remote';

  let { item } = $props();
</script

<plikes: {await getLikes(item.id)}</p
```

Async SSR isn’t yet implemented in Svelte, which means this will only load in the client for now. Once SSR is supported, this will be able to hydrate correctly, not refetching data

Queries are _thenable_, meaning they can be awaited. But they're not just promises, they also provide properties like `loading` and `current` (which contains the most recent value, but is initially `undefined`) and methods like `override(...)` (see the section on optimistic UI, below) and `refresh()`, which fetches new data from the server. We’ll see an example of that in a moment.

Query objects are cached in memory for as long as they are actively used, using the serialized arguments as a key — in other words `myQuery(id) === myQuery(id)`. Refreshing or overriding a query will update every occurrence of it on the page. We use Svelte's reactivity system to intelligently clear the cache to avoid memory leaks.

### form

Forms are the preferred way to write data to the server:

```ts
import { query, form } from '$app/server';
import * as db from '$lib/server/db';

export const getLikes = query(async (id: string) = {/*...*/});

export const addLike = form(async (data: FormData) = {
  const id = data.get('id') as string;

  await sql`
    update item
    set likes = likes + 1
    where id = ${id}
  `;

  // we can return arbitrary data from a form function
  return { success: true };
});
```

A form object such as `addLike` has enumerable properties — `method`, `action` and `onsubmit` — that can be spread onto a `<form` element. This allows the form to work without JavaScript (i.e. it submits data and reloads the page), but it will also automatically progressively enhance the form, submitting data _without_ reloading the entire page.

```svelte
<script
  import { getLikes, addLike } from './data.remote';

  let { item } = $props();
</script

<form {...addLike}
  <input type="hidden" name="id" value={item.id} /
  <buttonadd like</button
</form

<plikes: {await getLikes(item.id)}</p
```

By default, all queries used on the page (along with any `load` functions) are automatically refreshed following a form submission, meaning `getLikes(...)` will show updated data.

In addition to the enumerable properties, `addLike` has non-enumerable properties such as `result`, containing the return value, and `enhance` which allows us to customize how the form is progressively enhanced. We can use this to indicate that _only_ `getLikes(...)`should be refreshed, and to provide nicer behaviour in the case that the submission fails (by default, an error page will be shown):

```svelte
<script
  import { getLikes, addLike } from './data.remote';

  let { item } = $props();
</script

{#if addLike.result?.success}
  <psuccess!</p
{/if}

<form {...addLike.enhance(async ({ submit }) = {
  try {
    await submit();

    // if this occurs immediately after the submission,
    // it will prevent a global refresh
    getLikes(item.id).refresh();
  } catch (error) {
    // instead of showing an error page,
    // present a demure notification
    showToast(error.message);
  }
}}
  <input type="hidden" name="id" value={item.id} /
  <buttonadd like</button
</form

<plikes: {await getLikes(item.id)}</p
```

`form.result` need not indicate success — it can also contain validation errors along with any data that should repopulate the form on page reload, [much as happens today with form actions](https://svelte.dev/tutorial/kit/form-validation).

We can go one step further and enable _single-flight mutations_ — meaning that the updated data for `getLikes(...)` is sent back from the server along with the form result — by moving the `refresh` call to the server:

```diff
import { query, form } from '$app/server';
import * as db from '$lib/server/db';

export const getLikes = query(async (id: string) = {
  const [row] = await sql`select likes from item where id = ${id}`;
  return row.likes;
});

export const addLike = form(async (data: FormData) = {
  const id = data.get('id') as string;

  await sql`
    update item
    set likes = likes + 1
    where id = ${id}
  `;

+ await getLikes(id).refresh();

  // we can return arbitrary data from a form function
  return { success: true };
});
```

### command

For cases where serving no-JS users is impractical or undesirable, `command` offers an alternative way to write data to the server.

```diff
-import { query, form } from '$app/server';
+import { query, command } from '$app/server';
import * as db from '$lib/server/db';

export const getLikes = query(async (id: string) = {
  const [row] = await sql`select likes from item where id = ${id}`;
  return row.likes;
});

-export const addLike = form(async (data: FormData) = {
-  const id = data.get('id') as string;
+export const addLike = command(async (id: string) = {

  await sql`
    update item
    set likes = likes + 1
    where id = ${id}
  `;

  getLikes(id).refresh();

  // we can return arbitrary data from a command
  return { success: true };
});
```

This time, simply call `addLike`, from (for example) an event handler:

```svelte
<script
  import { getLikes, addLike } from './data.remote';

  let { item } = $props();
</script

<button
  onclick={async () = {
    try {
      await addLike();
    } catch (error) {
      showToast(error.message);
    }
  }}

  add like
</button

<plikes: {await getLikes(item.id)}</p
```

Commands cannot be called during render.

As with forms, we can refresh associated queries on the server during the command for a single-flight mutation, or on the client after the command has run, otherwise all queries will automatically be refreshed.

### prerender

This function is like `query` except that it will be invoked at build time to prerender the result. Use this for data that changes at most once per redeployment.

```ts
import { prerender } from '$app/server';

export const getBlogPost = prerender((slug: string) = {
  // ...
});
```

You can use `prerender` functions on pages that are otherwise dynamic, allowing for partial prerendering of your data. This results in very fast navigation, since prerendered data can live on a CDN along with your other static assets.

When the entire page has `export const prerender = true`, you cannot use queries, as they are dynamic.

Prerendering is automatic, driven by SvelteKit's crawler, but you can also provide an `entries` option to control what gets prerendered, in case some pages cannot be reached by the crawler:

```ts
import { prerender } from '$app/server';

export const getBlogPost = prerender((slug: string) = {
  // ...
}, {
  entries: () = [
    ['first-post'],
    ['second-post'],
    ['third-post']
  ]
});
```

If the function is called at runtime with arguments that were not prerendered it will error by default, as the code will not have been included in the server bundle. You can set `dynamic: true` to change this behaviour:

```diff
import { prerender } from '$app/server';

export const getBlogPost = prerender((slug: string) = {
  // ...
}, {
+ dynamic: true,
  entries: () = [
    ['first-post'],
    ['second-post'],
    ['third-post']
  ]
});
```

## Optimistic updates

Queries have an `override` method, which is useful for optimistic updates. It receives a function that transforms the query, and returns a function that removes the override:

```diff
<script
  import { getLikes, addLike } from './data.remote';

  let { item } = $props();
</script

<button
  onclick={async () = {
+   const release = getLikes(item.id).override((n) = n + 1);

    try {
      await addLike();
    } catch (error) {
      showToast(error.message);
+   } finally {
+     release();
    }
  }}

  add like
</button

<plikes: {await getLikes(item.id)}</p
```

You can of course do `const likes = $derived(getLikes(item.id))` in your `<script` and then do `likes.override(...)` and `{await likes}` if you prefer, but since `getLikes(item.id)` returns the same object in both cases, this is optional

Multiple overrides can be applied simultaneously — if you click the button multiple times, the number of likes will increment accordingly. If `addLike()` fails, releasing the override will decrement it again, otherwise the updated data (sans override) will match the optimistic update.

## Validation

Data validation can be performed with the `validate` function, which accepts a [Standard Schema](https://standardschema.dev/) object and a callback:

```ts
import { validate } from '@sveltejs/kit'
import { query } from '$app/server'
import { z } from 'zod/v4'

const schema = z.object({
	id: z.string()
})

export const getStuff = query(
	validate(
		schema,
		(async({ id }) = {
			// `id` is typed correctly. if the function
			// was called with bad arguments, it will
			// result in a 422 response
		})
	)
)
```

## Accessing the current request event

SvelteKit exposes a function called [`getRequestEvent`](https://svelte.dev/docs/kit/$app-server#getRequestEvent) which allows you to get details of the current request inside hooks, `load`, actions, server endpoints, and the functions they call.

This function can now also be used in `query`, `form` and `command`, allowing us to do things like reading and writing cookies:

```ts
import { getRequestEvent, query } from '$app/server';
import { findUser } from '$lib/server/db';

export const getProfile = query(async () = {
  const user = await getUser();

  return {
    name: user.name,
    avatar: user.avatar
  };
});

// this function could be called from multiple places
function getUser() {
  const { cookies, locals } = getRequestEvent();

  locals.userPromise ??= findUser(cookies.get('session_id'));
  return await locals.userPromise;
}
```

Note that some properties of `RequestEvent` are different in remote functions. There are no `params` or `route.id`, and you cannot set headers (other than writing cookies, and then only inside `form` and `command` functions), and `url.pathname` is always `/` (since the path that’s actually being requested by the client is purely an implementation detail).

## Redirects

Inside `query`, `form` and `prerender` functions it is possible to use the [`redirect(...)`](https://svelte.dev/docs/kit/@sveltejs-kit#redirect) function. It is _not_ possible inside `command` functions, as you should avoid redirecting here. (If you absolutely have to, you can return a `{ redirect: location }` object and deal with it in the client.)

## Future work / open questions

### Server caching

We want to provide some kind of caching mechanism down the line, which would give you the speed of prerendering data while also reacting to changes dynamically. If you're using Vercel, think of it as ISR on a function level.

We would love to hear your opinions on this matter and gather feedback around the other functions before committing to a solution.

### Client caching

Right now a query is cached and deduplicated as long as there's one active subscription to it. Maybe you want to keep things around in memory a little longer, for example to make back/forward navigation instantaneous? We haven't explored this yet (but have some ideas) and would love to hear your use cases (or lack thereof) around this.

Prerendered data _could_ be kept in memory as long as the page is open — since we know it’s unchanging, it never needs to be refetched. The downside is that the memory could then never be freed up. Perhaps this needs to be configurable.

Conversely, for queries that we know _will_ become stale after a certain period of time, it would be useful if the query function could communicate to the client that it should be refetched after `n` seconds.

### Batching

We intend to add client-side batching (so that data from multiple queries is fetched in a single HTTP request) and server-side batching that solves the n + 1 problem, though this is not yet implemented.

### Streaming

For real-time applications, we have a sketch of a primitive for streaming data from the server. We’d love to hear your use cases.
