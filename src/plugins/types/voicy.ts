export interface Root {
  is_final: boolean;
  speech: Speech;
  text: string;
}

export interface Speech {
  confidence: number;
  tokens: Token[];
}

export interface Token {
  confidence: number;
  end: number;
  start: number;
  token: string;
}
