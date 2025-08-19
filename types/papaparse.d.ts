declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[]
    errors: unknown[]
    meta: unknown
  }

  export interface ParseConfig<T> {
    header?: boolean
    skipEmptyLines?: boolean | 'greedy'
    worker?: boolean
    dynamicTyping?: boolean | ((field: string | number) => boolean)
    complete?: (results: ParseResult<T>) => void
  }

  export function parse<T = any>(input: string, config?: ParseConfig<T>): ParseResult<T>
}


