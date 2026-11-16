---
title: Error Codes
description: Infinite Table Error Codes
layout: API
---

<PropTable sort>

<Prop name="DS001">

> The error happens when you pass a new `data` prop on every render.

```tsx file="error-codes.snippet.tsx" region="dont-dont-use-a-new-reference-of-the-data-prop" title="DONT: Dont use a new reference of the data prop on every render"
```

```tsx file="error-codes.snippet.tsx" region="do-use-the-same-reference-of-the-data" title="DO: Use the same reference of the data"
```

</Prop>

</PropTable>