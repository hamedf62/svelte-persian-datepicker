import PersianDate from '@alireza-ab/persian-date';

try {
	console.log('Testing PersianDate with array [2025, 1, 1, 14, 30, 0]...');
	const pd = new PersianDate([2025, 1, 1, 14, 30, 0]);
	console.log('Gregorian:', pd.toString('YYYY/MM/DD HH:mm:ss'));
	console.log('Jalali:', pd.toString('jYYYY/jMM/jDD HH:mm:ss'));
} catch (e) {
	console.error('Error:', e);
}
