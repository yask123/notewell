export interface Metrics {
  count(name: string): void;
  timing(name: string, ms: number): void;
}

export class ConsoleMetrics implements Metrics {
  count(name: string) {
    console.log(`metric ${name} 1`);
  }

  timing(name: string, ms: number) {
    console.log(`metric ${name} ${ms.toFixed(1)}ms`);
  }
}

export class NoMetrics implements Metrics {
  count() {}
  timing() {}
}
