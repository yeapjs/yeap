<img width="128" src="./logo.svg" alt="Yeap logo">

# Yeap 🎉
A magicless UI builder

## What is Yeap ?

Yeap is a [React](https://github.com/facebook/react) alternative to be the most simplify and small as possible without virtual dom (actualy ~6kb ungzip for a small application). Based on reactivity, it is easily usable with web component.

## Why Yeap

### Yeap VS React (or [Preact](https://github.com/preactjs/preact))

React has side effects, when you want to create a component, and you update it, React re-render a lot of components whereas nothing about them ask to be re-rendering. With Yeap this probleme has solved, you call the component **only** when you need them, no useless re-render.

### Yeap VS [Solid](https://github.com/solidjs/solid)

Yeap and Solid are in the idea the same, but the main difference is in the compilation, Solid compile with its own compiler, unlike Yeap decide to use the default jsx compiler. 
