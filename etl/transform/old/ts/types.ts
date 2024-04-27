interface LCAPIYear {
    Settings: {
      [index: string]: any;
      Year: number;
    };
    Metadata?: any;
    Messages?: any;
    LitCal: {
        [index: string]: {
            [index: string]: any;
            data: string;
            grade: number;
            isVigilMass?: boolean;
        }
    }
}

export { LCAPIYear };