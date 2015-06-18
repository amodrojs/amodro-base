# Loader plugin API

**Preliminary docs, still in progress**

With the use of [amodro-lifecycle](https://github.com/amodrojs/amodro-lifecycle), the style of the API is to match the lifecycle steps. There are some special considerations for transpiler plugins to make it easy just to provide a `translate` function for them.

Loader plugins are regular modules that implement an API that will be used for the resourceIds tied to that loader plugin ID. Example loader plugin dependency:

    text!templates/list.html

`text` is the loader plugin ID (pluginId), `templates/list.html` is the resource ID or (resourceId).

