module.exports = {
	dayConversion: {
		'M': 'Monday',
		'T': 'Tuesday',
		'W': 'Wednesday',
		'R': 'Thursday',
		'F': 'Friday',
		'S': 'Saturday'
	},
	dayToDate: {
		'M': 16,
		'T': 17,
		'W': 18,
		'R': 19,
		'F': 20,
		'S': 21
	},
	dateSort: function(a, b) {
    if(a.date[0].getTime() < b.date[0].getTime())
      return -1;
    if(a.date[0].getTime() > b.date[0].getTime())
      return 1;
    return 0;
  }
}
