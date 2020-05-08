# Redux ducks generator

This is a Visual Studio Code extension to quickly generate simple Redux ducks-pattern-style reducers from TypeScript interfaces.

## How it works

Turns your TypeScript interface from this:

```typescript
interface Example {
	propOne: string
	propTwo: number[]
	propThree: boolean
	propFour: Record<string, string>
}
```

into this:

```typescript
// Types

export interface ExampleState {
	propOne: string
	propTwo: number[]
	propThree: boolean
	propFour: Record<string, string>
}

export interface ExampleAction extends ExampleState {
	type: ExampleActionTypes
}

export const initialExampleState : ExampleState = {
	propOne: '',
	propTwo: [],
	propThree: false,
	propFour: undefined,
}

export enum ExampleActionTypes {
	SET_PROPONE = "example/set-propone",
	SET_PROPTWO = "example/set-proptwo",
	SET_PROPTHREE = "example/set-propthree",
	SET_PROPFOUR = "example/set-propfour",
}

// Action creators

export function setPropOne(propOne: string) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROPONE, propOne: propOne};
}

export function setPropTwo(propTwo: number[]) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROPTWO, propTwo: propTwo};
}

export function setPropThree(propThree: boolean) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROPTHREE, propThree: propThree};
}

export function setPropFour(propFour: Record<string, string>) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROPFOUR, propFour: propFour};
}

// Reducer

const ExampleReducer = (state: ExampleState = initialExampleState, action: ExampleAction) => {
	switch(action.type) {
		case ExampleActionTypes.SET_PROPONE:
			return {...state, propOne: action.propOne};
		case ExampleActionTypes.SET_PROPTWO:
			return {...state, propTwo: action.propTwo};
		case ExampleActionTypes.SET_PROPTHREE:
			return {...state, propThree: action.propThree};
		case ExampleActionTypes.SET_PROPFOUR:
			return {...state, propFour: action.propFour};
		default:
			return state;
	}
}

export default ExampleReducer;
```

## How to use

Either highlight a single interface or open a file with a single interface in the editor, press `Ctrl+Shift+P` or any hotkey that opens the command window, search for `Redux: Convert a TypeScript interface to a ducks-style reducer`, click it or press the `Enter` key and let the magic happen.

## Known Issues

- Doesn't work  when there are multiple interfaces selected (or in case of no selection - in open editor)
- May not support every code formatting style

## Release Notes

### 0.1.0 (2020-05-07)

Initial release

## Source code

Available on https://github.com/yasikovsky/redux-ducks-generator.

## Questions?

E-mail me on michal@jasikowski.pl.
