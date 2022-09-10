<img src="./banner.svg" alt="Yeap logo">

## What is Yeap ?

Yeap is a [React](https://github.com/facebook/react) alternative to be the most simplify and small as possible without virtual dom (actualy ~7.5kb ungzip on [bundlephobia](https://bundlephobia.com/package/yeap)). Based on reactivity, it is easily usable with web component.

## Why Yeap

### Yeap VS React (or [Preact](https://github.com/preactjs/preact))

React has side effects, when you want to create a component, and you update it, React re-render a lot of components whereas nothing about them ask to be re-rendering. With Yeap this probleme has solved, you call the component **only** when you need them, no useless re-render.

### Yeap VS [Solid](https://github.com/solidjs/solid)

Yeap and Solid are in the idea the same, but the main difference is in the compilation, Solid compile with its own compiler, unlike Yeap decide to use the default jsx compiler. 

## Installation

```bash
npm install yeap 
# or 
yarn add yeap 
#or 
pnpm add yeap
```

[Templates](https://github.com/yeapjs/templates) and a [Preset for Vite](https://github.com/yeapjs/vite-preset) are available.

<hr>

## How to use

Yeap use the jsx, and the reactivity system.
The reactivity system is based on the function `createReactor`.

`createReactor` return a reactor, it's the base of [the reactivity system](#reactivity-system).

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const count = createReactor(0)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

### Reactivity system

`createReactor` is the main function of the reactivity system, it return a reactor. A reactor is a function. When you call it, it return the current value of the reactor. (it's the getter)

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)
console.log(a()) // 0
```

And when you want to update the value, it's easy, you just call the reactor with the new value, it will return the old value and save the new value. (it's the setter)

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)
console.log(a(1)) // 0
console.log(a()) // 1
```

It's possible to use the setter with a function, it will take the old value in parameter and return the new value.

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)
console.log(a((old) => old + 1)) // 0
console.log(a()) // 1
```

On top of this, a reactor a lot of other methods like `subscribe`, `freeze` or `reader`.

The `.subscribe` method is used to subscribe to the reactor, it's a take one parameter, and it's a function that will be called when the reactor is updated. The function will receive the old value and the new value.

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)

a.subscribe((prev, next) => {
  console.log(
    "a changed", 
    prev, // 0
    next // 1
  )
})
a(1)
```

The method `.subscribe` return a function that you can use to unsubscribe.

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)
const unsubscribe = a.subscribe((prev, next) => {
  console.log("a changed", prev, next) // never called
})
unsubscribe()
a(1)
```

Note: `.subscribe` is used in internal of `yeap/web` for observe the changes of the reactivity system and update the dom in consequence.

`.freeze` and `.reader` are used to create a ReadOnlyReactor, but the difference between both is the value of the ReadOnlyReactor.

With `.freeze`, the value isn't updated over time.

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)
const b = a.freeze()

a(1)
console.log(a()) // 1
console.log(b()) // 0
```

but with `.reader`, the value is updated over time.

```js
import { createReactor } from "yeap/app"

const a = createReactor(0)
const b = a.reader()

a(1)
console.log(a()) // 
console.log(b()) // 1
```

#### ReadOnlyReactor

In the same way, you have `createRef`, it's a function that return a reactor like `createReactor`, but it can be updated only one time (default value isn't an update), after it become a `ReadOnlyReactor`.

Example:

```js
import { createRef } from "yeap/app"

const a = createRef(0)
console.log(a(1)) // 0
console.log(a(2)) // 1
console.log(a()) // 1
```

Example of use:

```jsx
import { createRef } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const paragraph = createRef(null)
  
  return (
    <div>
      <p ref={paragraph}>Hello World!</p>
      <button onClick={() => paragraph().textContent = "Hello Yeap!"}>Update the text of the paragraph</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

### Effect and Computed

Yeap has two function to create effect and computed, `createEffect` and `createComputed`.

`createEffect` is a function that take a callback and dependencies, when a dependency is updated, the callback was recalled.

```jsx
import { createEffect, createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const count = createReactor(0)
  
  createEffect(() => {
    console.log(count())
  }, count)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

And in the same way, `createComputed` is a function that take a callback, and return a reactor, the function take the same arguments as the function of `createEffect`.

```jsx
import { createComputed, createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const count = createReactor(0)
  const double = createComputed(() => count() * 2, count)

  return (
    <div>
      <p>{count}</p>
      <p>{double}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

Or you can use the method `.compute` of the reactor, it's the same as `createComputed`, but the callback take the value of the reactor as first argument and that all.

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const count = createReactor(0)
  const double = count.compute((count) => count * 2)

  return (
    <div>
      <p>{count}</p>
      <p>{double}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

When can use `createComputed` or `.compute`. It's not an obligation, but `.compute` it's make to be used in the jsx directly.

`createComputed` and `createEffect` can be take options before the dependencies.

### Condition

In yeap you can use condition in the jsx, but you can't use `if`, `else`, `&&` or `||` because it's break the reactivity system, you can use `createComputed` or `.compute` to create a condition.

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const count = createReactor(0)

  return (
    <div>
      <p>{count}</p>
      {count.compute((count) => {
        if(count > 0) return <p>Count is positive</p>
        else if(count < 0) return <p>Count is negative</p>
        else return <p>Count is null</p>
      })}
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

But for a condition if/else you can use the method `.when`, it takes two arguments, the truthy value and the falsy value (truthy and falsy value can be a function).

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const show = createReactor(true)

  return (
    <div>
      <button onClick={() => show((show) =>!show)}>{show.when(() =>"To Hide", "To Show")}</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

And in the same way, you have the attribute `when` and `fallback` on html element and component.

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const show = createReactor(true)

  return (
    <div>
      <button onClick={() => show((show) =>!show)}>{show.when("To Hide", "To Show")}</button>
      <p when={show} fallback={<p>Bye!</p>}>Hello!</p>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

### Lists/Arrays

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const list = createReactor([0, 1, 2, 3, 4])

  return (
    <div>
      <ul>
        {list.compute((list) => {
          const newList = []
          for(const i of list) {
            newList.push(<li>{i} ** 2 = {i*i}</li>)
          }
          return newList
        })}
      </ul>
      <button onClick={() => list((list) =>[...list, list.length])}>+ item</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

It's possible, but it's not the best way to do it, you can use the method `.map` (or other method on a array according to usage).

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const list = createReactor([0, 1, 2, 3, 4])

  return (
    <div>
      <ul>
        {list.map((i) => <li>{i} ** 2 = {i*i}</li>) /*it keep the reactivity*/}
      </ul>
      <button onClick={() => list((list) =>[...list, list.length])}>+ item</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

But, why it works?

#### More about reactivity

If you write in vanilla js that:

```js
const list = [0, 1, 2, 3, 4]
const doubleList = list.map((i) => i * 2)
```

`doubleList` has the value `[0, 2, 4, 6, 8]`, but if you push a new item in the list, the value of doubleList stays the same.

With the reactivity, when you want to get a property you can get normally, it just change the value of the property by a reactor and it automatically update when the reactor parent is updated.

With a reactor, the previous example gives:

```js
const list = createReactor([0, 1, 2, 3, 4])
const doubleList = list.map((i) => i * 2)
```

Now, `doubleList()` has the value `[0, 2, 4, 6, 8]`, and if you push a new item in the list, the value of doubleList is updated.

Warning: 
 - if you use a reactor in a array, you can't use the methods `.push`, `.pop` or other methods that change the value directly, because it's not possible to observe the changes of the array.
 - the value of property became a reactor, but the return value of a method is not a reactor but a ReadOnlyReactor.

Example:

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const inputValue = createReactor("")

  return (
    <div>
      <input value={inputValue} placeholder="Type something here" onInput={(e) => inputValue(e.currentTarget.value)}>
      the input has a length of {inputValue.length}
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

In addition to that, you have on the jsx attribute `key` that works like the `key` attribute in React.

### Async/Await

```jsx
import { createAsync } from "yeap/app"
import { Fragment } from "yeap/components" // if you use the yeap-vite-preset you can't import Fragment directly because it's already imported with the yeap-vite-preset (same for h in yeap/web)
import { render } from "yeap/web"

function App () {
  const {data: count, loading} = createAsync(async () =>{
    const res = await fetch("https://api.github.com/repos/yeapjs/yeap/stargazers")
    const data = await res.json()

    return data.length
  }, 0)

  return (
    <div>
      <p>{loading.when("Loading...", <Fragment>The repo yeapjs/yeap has {count} star{count.compute((c) => c > 1 ? "s" : "")}</Fragment>)}</p>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

This is how you can use async/await in yeap, you can use `createAsync` to create an async reactor, it takes two arguments, the async function and the default value.

But if you want to refresh the data when a reactor change, you have `createAsyncComputed`, it works like that:

```js
const {data, error, loading, refetch} = createAsync(asyncCallback, defaultData)

createComputed(refetch, deps) // or createEffect(refetch, deps)
```

### Mount/Unmount and Events

In yeap you have 3 functions, `onMount`, `onUnmount` and `createEventDispatcher`.

`onMount` and `onUnmount` are called when the component is mounted and unmounted in the DOM.

And `createEventDispatcher` is used to create an event dispatcher, it returns a function that you can call to dispatch the event. (call a function in properties named `on` + name of the event, in camelCase)

```jsx
import { createReactor, createEventDispatcher } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const count = createReactor(0)
  const dispatch = createEventDispatcher()

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
      <button onClick={() => dispatch("count", count)}>Dispatch</button>
    </div>
  )
}

/**
 * @param {CustomEvent} param0
 */
function handleCount ({detail: count}) {
  console.log(count)
}

render(<App onCount={handleCount}/>, document.getElementById("root"))
```

An event can be recieve an array on the format `[function, ...args]`

### Event Modifiers and Directives

In yeap you have `createDirective` and `createEventModifier`. Directives are made to update html elements and event modifiers as their name indicates, it is to modify the `event` object.

`event:event-modifier` is the syntax for event modifiers and `use:directive` for the directives.

### Context

Works exactly like in React.

### Persistance

You have the function `createPersistor`, it takes a callback and call it only once, when the app is mounted. But if a component is unmounted and mounted again, the callback is not called, and the value is kept.

There are also 2 aliases, `createPersistentCallback` and `createPersistentReactor`.

```jsx
import { createReactor, createPersistor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const show = createReactor(true)

  return (
    <div>
      <button onClick={() => show((show) =>!show)}>{show.when("Hide Counter", "Show Counter")}</button>

      <Counter when={show} />
    </div>
  )
}

function Counter () {
  const count = createPersistor(() => createReactor(0))

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

render(<App />, document.getElementById("root"))
```

### Component

You can create a component with a function, but you have only one difference between a react funtional component and a yeap component, you have 2 arguments, the props and the children.

```jsx
import { createReactor, createComponent } from "yeap/app"
import { render } from "yeap/web"

function Counter({ start }, children) {
  const count = createReactor(start)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
      {children}
    </div>
  )
}

function App () {
  return (
    <Counter start={0}>
      Hello World!
    </Counter>
  )
}

render(<App />, document.getElementById("root"))
```

In SolidJS you can create a component like that, but you can't destructure the props because you lose the reactivity, but in Yeap you can.

Yeap have also 3 built-in components, `Fragment`, `Dynamic`, `Portal` and one function for async components, `lazy`.

### Web Component

Yeap has a function to create web component, `define` in `yeap/web`, it's like the `customElements.define` of the web component API, it's take a name, a function and options.

```jsx
import { createReactor } from "yeap/app"
import { define } from "yeap/web"

function MyCounter ({ ref: element }) {
  const count = createReactor(0)

  console.log(element)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count((count) =>count + 1)}>+</button>
    </div>
  )
}

define("my-counter", MyCounter, {
  reactiveAttributes: [],
  shadowed: "closed" // "closed" | "open" | false (default)
})
```

The function in `define` is a yeap component, it takes the props and the children, and you can use the `reactiveAttributes` option to make some attributes reactive, and the `shadowed` option to make the component shadowed.

It's possible to use `YourComponent.defaultProps` to set the default props of the component.

It's also possible to use `YourComponent.attributeTypes` to cast the attributes' value into `Number`, `BigInt` or `Boolean` (for boolean it check if you have the attribute), see the issue #12 for more detail.

The component can be take 2 arguments, the attributes and the child nodes. When an attribute is in the `reactiveAttributes` array, it became a reactor. In the attributes, you can find `ref`, is the html element.
