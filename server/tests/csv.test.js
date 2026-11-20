import { cleanAndValidateCSV } from '../services/csvService.js';

describe('CSV Service – Cleaning & Validation', () => {
  test('Empty review should be skipped and flagged', () => {
    const csvData = `review_id,product,rating,date,review_text
R101,Headphones,5,2024-01-01,""
R102,Headphones,4,2024-01-02,"   "
R103,Headphones,5,2024-01-03,"Good product"`;

    const { rows, stats } = cleanAndValidateCSV(csvData);

    expect(stats.total_rows).toBe(3);
    expect(stats.valid_rows).toBe(1);
    expect(stats.skipped_rows).toBe(2);

    expect(rows[0].status).toBe('skipped');
    expect(rows[0].reason).toBe('empty_review_text');
    expect(rows[0].review_id).toBe('R101');

    expect(rows[1].status).toBe('skipped');
    expect(rows[1].reason).toBe('empty_review_text');
    expect(rows[1].review_id).toBe('R102');

    expect(rows[2].status).toBe('pending');
    expect(rows[2].review_text).toBe('Good product');
  });

  test('Missing or invalid rating (like "five") should become null', () => {
    const csvData = `review_id,product,rating,date,review_text
R104,Watch,,2024-01-01,"Nice watch"
R105,Watch,five,2024-01-02,"Loved the design"
R106,Watch,6,2024-01-03,"Screen is bright"
R107,Watch,4,2024-01-04,"Great battery"`;

    const { rows } = cleanAndValidateCSV(csvData);

    expect(rows[0].rating).toBeNull();
    expect(rows[1].rating).toBeNull();
    expect(rows[2].rating).toBeNull(); // out of 1-5 range
    expect(rows[3].rating).toBe(4);    // valid integer 4
  });

  test('Duplicate reviews should be detected and flagged with duplicate_of', () => {
    const csvData = `review_id,product,rating,date,review_text
R108,Shoes,5,2024-01-01,"Great fit and very comfortable."
R109,Shoes,4,2024-01-02,"Different review"
R110,Shoes,5,2024-01-03,"great fit and very   comfortable.  "`;

    const { rows, stats } = cleanAndValidateCSV(csvData);

    expect(stats.total_rows).toBe(3);
    expect(stats.duplicate_rows).toBe(1);

    expect(rows[0].is_duplicate).toBe(false);
    expect(rows[0].review_id).toBe('R108');

    expect(rows[1].is_duplicate).toBe(false);

    // R110 normalized text matches R108
    expect(rows[2].is_duplicate).toBe(true);
    expect(rows[2].duplicate_of).toBe('R108');
    expect(rows[2].review_id).toBe('R110');
  });

  test('Throws error if required columns are missing', () => {
    const invalidCSV = `id,product_name,stars,text
1,Phone,5,"Nice"`;

    expect(() => {
      cleanAndValidateCSV(invalidCSV);
    }).toThrow(/Missing required column/i);
  });
});
