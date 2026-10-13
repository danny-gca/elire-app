import raw from '@/data/dataset.json';
import { DatasetSchema } from '@/schemas/dataset';

describe('dataset.json', () => {
  it('respecte le schéma (régénérer avec npm run build:data)', () => {
    expect(() => DatasetSchema.parse(raw)).not.toThrow();
  });
});
