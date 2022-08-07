<img src="./banner.svg" alt="Yeap logo">

## What is Yeap ?

Yeap is a [React](https://github.com/facebook/react) alternative to be the most simplify and small as possible without virtual dom (actualy ~7.5kb ungzip on [bundlephobia](https://bundlephobia.com/package/yeap)). Based on reactivity, it is easily usable with web component.

## Why Yeap

### Yeap VS React (or [Preact](https://github.com/preactjs/preact))

React has side effects, when you want to create a component, and you update it, React re-render a lot of components whereas nothing about them ask to be re-rendering. With Yeap this probleme has solved, you call the component **only** when you need them, no useless re-render.

### Yeap VS [Solid](https://github.com/solidjs/solid)

Yeap and Solid are in the idea the same, but the main difference is in the compilation, Solid compile with its own compiler, unlike Yeap decide to use the default jsx compiler. 

<hr>

## How to use

Yeap use the jsx, and the reactivity system.
The reactivity system is based on the function `createReactor`.

`createReactor` return a reactor, it's in one variable a getter and a setter, and it's a function that you want to call to update the value, for update call it and pass the new value, it will return the old value.

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

In the same way, you can use `createRef`, it's a function that return a reactor like `createReactor`, but it can be updated only one time (default value isn't an update), after it become a `ReadOnlyReactor`.

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

But for a condition if/else you can use the method `.when`, it takes two arguments, the truthy value and the falsy value.

```jsx
import { createReactor } from "yeap/app"
import { render } from "yeap/web"

function App () {
  const show = createReactor(true)

  return (
    <div>
      <button onClick={() => show((show) =>!show)}>{show.when("To Hide", "To Show")}</button>
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

It's possible, but it's not the best way to do it, you can use the method `.map` (or other method on a array) of the reactor, in internal it will use `createComputed`.

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

### Async/Await

```jsx
import { createAsync } from "yeap/app"
import { Fragment } from "yeap/components"
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

```jsx
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

### Web Component

Yeap has a function to create web component, `define` in `yeap/web`, it's like the `customElements.define` of the web component API, it's take a name, a function and  options.

```jsx
import { createReactor } from "yeap/app"
import { define } from "yeap/web"

function MyCounter () {
  const count = createReactor(0)

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
