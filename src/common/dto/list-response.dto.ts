// DTO genérico para respostas de listagem
// Padrão: { items: [...] }

import { ApiProperty } from "@nestjs/swagger";

export class ListResponseDto<T> {
  @ApiProperty({ description: "List of items", isArray: true })
  items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  static of<T>(items: T[]): ListResponseDto<T> {
    return new ListResponseDto(items);
  }
}
