# Redux ducks generator

This is a Visual Studio Code extension to quickly generate simple Redux ducks-pattern-style reducers from TypeScript interfaces.

## How it works

Finds the first Typescript interface in selection or active editor and turns it from this:

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
interface Example {
	propOne: string
	propTwo: number[]
	propThree: boolean
	propFour: Record<string, string>
}

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
	SET_PROP_ONE = "example/set-prop-one",
	SET_PROP_TWO = "example/set-prop-two",
	SET_PROP_THREE = "example/set-prop-three",
	SET_PROP_FOUR = "example/set-prop-four",
}

// Action creators

export function setPropOne(propOne: string) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROP_ONE, propOne: propOne};
}

export function setPropTwo(propTwo: number[]) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROP_TWO, propTwo: propTwo};
}

export function setPropThree(propThree: boolean) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROP_THREE, propThree: propThree};
}

export function setPropFour(propFour: Record<string, string>) : ExampleAction {
	return {...initialExampleState, type: ExampleActionTypes.SET_PROP_FOUR, propFour: propFour};
}

// Reducer

const ExampleReducer = (state: ExampleState = initialExampleState, action: ExampleAction) => {
	switch(action.type) {
		case ExampleActionTypes.SET_PROP_ONE:
			return {...state, propOne: action.propOne};
		case ExampleActionTypes.SET_PROP_TWO:
			return {...state, propTwo: action.propTwo};
		case ExampleActionTypes.SET_PROP_THREE:
			return {...state, propThree: action.propThree};
		case ExampleActionTypes.SET_PROP_FOUR:
			return {...state, propFour: action.propFour};
		default:
			return state;
	}
}

export default ExampleReducer;
```

while completely replacing everything in the editor that's after the interface. It still leaves the stuff before it, so you can put your comments and other things there (as long as they are not an interface).

## How to use

Either highlight an interface or open a file with an interface in the editor, press `Ctrl+Shift+P` or any hotkey that opens the command window, search for `Redux: Convert a TypeScript interface to a ducks-style reducer`, click it or press the `Enter` key and let the magic happen.

## Known Issues

- Not tested with objects nested in interfaces
- May not support every code formatting style

## Release Notes

### 0.2.0 (2020-05-19)

- Improved interface detection
- Improved word splitting in property names
- The extension now replaces everything after the first found interface, while leaving the interface and everything before it intact. This way you can just add a new property to the interface, run the extension, and an update reducer will be generated without extra clicks.

### 0.1.0 (2020-05-07)

Initial release

## Source code

Available on https://github.com/yasikovsky/redux-ducks-generator.

## Questions?

E-mail me on michal@jasikowski.pl.
