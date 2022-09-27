import { Metric } from '.'

declare namespace bindings {

class Event {
  constructor(parent: Event, edge: boolean)

  getSampleFlag(): number

  toString(): string

  sendReport(): number
  sendStatus(): number

  static makeRandom(sample: boolean): Event
  static makeFromBuffer(buffer: Buffer): Event
  static makeFromString(s: string): Event | undefined
}

const MAX_SAMPLE_RATE: number
const MAX_METADATA_PACK_LEN: number
const MAX_TASK_ID_LEN: number
const MAX_OP_ID_LEN: number
const TRACE_NEVER: 0
const TRACE_ALWAYS: 1

function oboeInit(): void
function isReadyToSample(): boolean

namespace Reporter {
  function sendMetrics(metrics: Metric[]): { errors: Metric[] }
  function sendHttpSpan(obj: unknown): string | number
}

const path: string
const version: string

}
export = bindings
