export const learningStylePersona = [
	{
		input: {
			answers: [
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a'
			]
		},
		output: {
			// A single dominant persona (e.g., "Analytical Thinker")
			persona: [['ANT', 20]]
		}
	},
	{
		input: {
			answers: [
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b',
				'a',
				'b'
			]
		},
		output: {
			// Two equally dominant personas (e.g., "Analytical Thinker" and "Practical Problem Solver")
			persona: [
				['ANT', 10],
				['PPS', 9]
			]
		}
	},
	{
		input: {
			answers: [
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'a',
				'c',
				'c',
				'c',
				'c',
				'c',
				'c',
				'c',
				'c',
				'c',
				'c',
				'c'
			]
		},
		output: {
			// Two dominant personas with a small difference in scores (e.g., "Analytical Thinker" and "Creative Innovator")
			persona: [
				['CRI', 11],
				['ANT', 9]
			]
		}
	},
	{
		input: {
			answers: [
				'd',
				'e',
				'f',
				'd',
				'e',
				'f',
				'd',
				'e',
				'f',
				'd',
				'e',
				'f',
				'd',
				'e',
				'f',
				'd',
				'e',
				'f',
				'd',
				'e'
			]
		},
		output: {
			// Multiple moderate scores, indicating a balanced combination of several personas (e.g., "Social Learner", "Reflective Learner", "Detail-Oriented Learner")
			persona: [
				['SOL', 7],
				['RTL', 7],
				['DOL', 6]
			]
		}
	},
	{
		input: {
			// input with 2 responses for an answer
			answers: [
				'a',
				['b', 'c'],
				'd',
				['e', 'f'],
				'a',
				'b',
				'c',
				['d', 'e'],
				'f',
				'a',
				'b',
				['c', 'd'],
				'e',
				'f',
				'a',
				['b', 'c'],
				'd',
				'e',
				['f', 'a'],
				'b'
			]
		},
		output: {
			persona: [
				['ANT', 5],
				['DOL', 5],
				['CRI', 4]
			]
		}
	}
]
