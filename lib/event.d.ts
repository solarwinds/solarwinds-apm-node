import { KVData } from '.'

interface Edge {

}

declare class Event {
  constructor(span: string, label: string, parent?: Event, edge?: boolean)

  edges: Edge[]

  set error(error: Error | string)

  get taskId(): string
  get opId(): string

  set(data: KVData): void

  toString(): string

  sendReport(data?: KVData): void

  static get last(): Event | undefined | null
  static set last(event: Event | undefined | null)
}
export = Event
