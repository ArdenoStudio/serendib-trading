import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYearFromText,
  isCorruptVehicleYear,
  resolveVehicleYear,
} from '../api/_db.js';

test('isCorruptVehicleYear flags the Neon migration default', () => {
  assert.equal(isCorruptVehicleYear(1971), true);
  assert.equal(isCorruptVehicleYear(2020), false);
});

test('extractYearFromText reads the first year in copy', () => {
  assert.equal(extractYearFromText('2026 Toyota Raize Z 1.2L Hybrid'), 2026);
  assert.equal(extractYearFromText('Mercedes Benz c180 2014 161,000 km'), 2014);
});

test('extractYearFromText prefers the registration year in YYYY/YYYY imports', () => {
  assert.equal(
    extractYearFromText('TOYOTA CAMRY G 4th owner 2008/2010 Beige Interior'),
    2010
  );
});

test('resolveVehicleYear recovers from description when DB year is corrupt', () => {
  assert.equal(
    resolveVehicleYear({
      year: 1971,
      make: 'Honda',
      model: 'CR-V',
      description: '2018 Honda CR-V, 133,000 km driven.',
    }),
    2018
  );
});
