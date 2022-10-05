import { KVData } from '.'
import bindings from './addon'

interface Edge {

}

/**
 * A tracing event
 */
declare class Event {
  /**
   * 
   * @param span - Name of the event's span
   * @param label - Event label (usually `entry` or `exit`)
   * @param parent - Parent native event
   * @param edge - Whether this event should edge back to its parent
   */
  constructor(span: string, label: string, parent?: bindings.Event, edge?: boolean)

  edges: Edge[]

  /**
   * Set an error that occured during the event
   */
  set error(error: Error | string)

  /**
   * `taskId` obtained from native event
   */
  get taskId(): string
  /**
   * `opId` obtained from native event string representation
   */
  get opId(): string

  /**
   * Sets key-value data on the event
   * 
   * @param data - Key-value pairs to set
   */
  set(data: KVData): void

  /**
   * Obtains the X-Trace ID of the event
   */
  toString(): string

  /**
   * Sends this event to the reporter
   * 
   * @param data - Additional key-value pairs to set
   */
  sendReport(data?: KVData): void

  /**
   * Get the last event if any
   */
  static get last(): Event | undefined | null
  /**
   * Set the last event
   */
  static set last(event: Event | undefined | null)
}
export = Event
