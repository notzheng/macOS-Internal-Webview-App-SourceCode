/**
 * NOTE: You probably don't need to import this into any component except as a Provider, because the <Loc> component handles consuming.
 * This context provides an object that maps loc keys to the appropriate strings or string templates.
 */
import { createContext } from 'react'

const LocStringsContext = createContext<LocStrings>({})

export default LocStringsContext
