import PersianDate from '@alireza-ab/persian-date';

try {
	const dateStr = '1399/6/1 10:10';
	console.log('Testing new PersianDate().parse("' + dateStr + '")...');
	const pd = new PersianDate().parse(dateStr);
	console.log('pd:', pd.toString('jYYYY/jMM/jDD HH:mm:ss'));
	console.log('pd.endOf("day"):', pd.endOf('day').toString('jYYYY/jMM/jDD HH:mm:ss'));
} catch (e) {
	console.log('Failed:', e.message);
}
