const weightSubFieldsPerPersona = {
	student: {
		education: {
			degree: 2,
			fieldOfStudy: 5,
			university: 1,
			gpa: 1,
			favoriteCourses: 3
		},
		cultural: {
			ethnicity: 1,
			nationality: 1,
			language: 3,
			religion: 3,
			socioeconomicStatus: 1,
			educationSystem: 2
		},
		areaOfInterest: {
			hobbies: 4,
			academicInterests: 3,
			professionalInterests: 0,
			socialCauses: 1
		}
	},
	professional: {
		workExperience: {
			jobTitle: 2,
			company: 1,
			industry: 3,
			yearsOfExperience: 2,
			responsibilities: 2,
			areasOfExpertise: 4,
			skills: 4,
			certifications: 2,
			geographicLocation: 1
		},
		education: {
			degree: 1,
			fieldOfStudy: 2,
			university: 0,
			gpa: 1,
			favoriteCourses: 2
		},
		cultural: {
			ethnicity: 1,
			nationality: 1,
			language: 1,
			religion: 1,
			socioeconomicStatus: 1,
			educationSystem: 1
		},
		areaOfInterest: {
			hobbies: 3,
			academicInterests: 1,
			professionalInterests: 4,
			socialCauses: 4
		}
	}
}

function generateWorkExperience(
	learnerType,
	{
		jobTitle = '',
		company = '',
		industry = '',
		yearsOfExperience = '',
		responsibilities = '',
		areasOfExpertise = '',
		skills = '',
		certifications = '',
		geographicLocation = ''
	}
) {
	const weights = weightSubFieldsPerPersona[`${learnerType}`].workExperience

	const jobTitleStr = jobTitle
		? `I'm working as a ${jobTitle} (Weight: ${weights.jobTitle})`
		: ''
	const companyStr = company
		? ` at ${company} (Weight: ${weights.company})`
		: ''
	const industryStr = industry
		? `, in the ${industry} industry (Weight: ${weights.industry})`
		: ''
	const yearsOfExperienceStr = yearsOfExperience
		? `. My total years of experience in the industry is ${yearsOfExperience} years (Weight: ${weights.yearsOfExperience})`
		: ''

	const responsibilitiesStr = responsibilities
		? `. My main responsibilities include ${responsibilities} (Weight: ${weights.responsibilities})`
		: ''

	const areasOfExpertiseStr = areasOfExpertise
		? `. I have expertise in ${areasOfExpertise} (Weight: ${weights.areasOfExpertise})`
		: ''

	const skillsStr = skills
		? `. I've developed skills in ${skills} (Weight: ${weights.skills})`
		: ''

	const certificationsStr = certifications
		? `, and earned certifications like ${certifications} (Weight: ${weights.certifications})`
		: ''

	const geographicLocationStr = geographicLocation
		? `. I've worked at ${geographicLocation} (Weight: ${weights.geographicLocation})`
		: ''

	return `${jobTitleStr}${companyStr}${industryStr}${yearsOfExperienceStr}${responsibilitiesStr}${areasOfExpertiseStr}${skillsStr}${certificationsStr}${geographicLocationStr}`
}

function generateEducationalBackground(
	learnerType,
	{
		degree = '',
		fieldOfStudy = '',
		university = '',
		gpa = '',
		favoriteCourses = ''
	}
) {
	const weights = weightSubFieldsPerPersona[`${learnerType}`].education

	const degreeStr = degree
		? `I have a ${degree} (Weight: ${weights.degree})`
		: ''
	const fieldOfStudyStr = fieldOfStudy
		? ` in ${fieldOfStudy} (Weight: ${weights.fieldOfStudy})${
				university ? ` from ${university} (Weight: ${weights.university})` : ''
		  }`
		: ''
	const gpaStr = gpa ? `, with a GPA of ${gpa} (Weight: ${weights.gpa})` : ''
	const favoriteCoursesStr = favoriteCourses
		? `. my favorite courses in degree were ${favoriteCourses} (Weight: ${weights.favoriteCourses})`
		: ''
	return `${degreeStr}${fieldOfStudyStr}${gpaStr}${favoriteCoursesStr}`
}

function generateCulturalBackground(
	learnerType,
	{
		ethnicity = '',
		nationality = '',
		language = '',
		religion = '',
		socioeconomicStatus = '',
		educationSystem = ''
	}
) {
	const weights = weightSubFieldsPerPersona[`${learnerType}`].cultural

	const ethnicityStr = ethnicity
		? `I am of ${ethnicity} ethnicity (Weight: ${weights.ethnicity})`
		: ''
	const nationalityStr = nationality
		? `, a ${nationality} national (Weight: ${weights.nationality})`
		: ''
	const languageStr = language
		? `, and I speak ${language} (Weight: ${weights.language})`
		: ''
	const religionStr = religion
		? `. My religion is ${religion} (Weight: ${weights.religion})`
		: ''
	const socioeconomicStatusStr = socioeconomicStatus
		? `, and my socioeconomic status is ${socioeconomicStatus} (Weight: ${weights.socioeconomicStatus})`
		: ''
	const educationSystemStr = educationSystem
		? `. I was educated in the ${educationSystem} system (Weight: ${weights.educationSystem})`
		: ''

	return `${ethnicityStr}${nationalityStr}${languageStr}${religionStr}${socioeconomicStatusStr}${educationSystemStr}`
}

function generateAreaOfInterest(
	learnerType,
	{
		hobbies = '',
		academicInterests = '',
		professionalInterests = '',
		socialCauses = ''
	}
) {
	const weights = weightSubFieldsPerPersona[`${learnerType}`].areaOfInterest
	const hobbiesStr = hobbies
		? `My hobbies include ${hobbies} (Weight: ${weights.hobbies})`
		: ''
	const academicInterestsStr = academicInterests
		? ` and I have academic interests in ${academicInterests} (Weight: ${weights.academicInterests})`
		: ''
	const professionalInterestsStr = professionalInterests
		? `. Professionally, I'm interested in ${professionalInterests} (Weight: ${weights.professionalInterests})`
		: ''
	const socialCausesStr = socialCauses
		? `. I'm passionate about social causes such as ${socialCauses} (Weight: ${weights.socialCauses})`
		: ''

	return `${hobbiesStr}${academicInterestsStr}${professionalInterestsStr}${socialCausesStr}`
}

export function generateLearnerPersonaPrompt({
	learnerType,
	learnerPersona,
	queryContext,
	personaWeightage
}) {
	const {
		age,
		workExperience,
		educationalBackground,
		areaOfInterest,
		priorKnowledge,
		culturalBackground,
		analogyPreference,
		learningGoals
		// learningStyle
	} = learnerPersona

	const { topic, question } = queryContext

	const {
		ageWeight = 5,
		workExperienceWeight = 20,
		educationalBackgroundWeight = 15,
		areaOfInterestWeight = 15,
		priorKnowledgeWeight = 10,
		culturalBackgroundWeight = 10,
		analogyPreferenceWeight = 5,
		learningGoalsWeight = 20
		// learningStyleWeight = 5
	} = personaWeightage

	const generatedWorkExperience =
		learnerType === 'professional'
			? generateWorkExperience(learnerType, workExperience)
			: 'No Work Experience'
	const generatedEducationalBackground = generateEducationalBackground(
		learnerType,
		educationalBackground
	)
	const generatedAreaOfInterest = generateAreaOfInterest(
		learnerType,
		areaOfInterest
	)
	const generatedCulturalBackground = generateCulturalBackground(
		learnerType,
		culturalBackground
	)

	const tone =
		learnerPersona === 'student'
			? 'casual tone with emoji'
			: 'professional tone'

	const prompt = `
You are playing the role of a teaching assistant
Learner information:
Age: ${age} (Weightage: ${ageWeight}%)
Educational Background: ${generatedEducationalBackground} (Weightage: ${educationalBackgroundWeight}%)
Work Experience: ${generatedWorkExperience} (Weightage: ${workExperienceWeight}%)
Areas of Interest: ${generatedAreaOfInterest} (Weightage: ${areaOfInterestWeight}%)
Prior Knowledge: ${priorKnowledge} (Weightage: ${priorKnowledgeWeight}%)
Cultural Background: ${generatedCulturalBackground} (Weightage: ${culturalBackgroundWeight}%)
Analogy Preference: Preferrably use analogies from ${analogyPreference} to explain the concept (Weightage: ${analogyPreferenceWeight}%)
Learning Goals: ${learningGoals} (Weightage: ${learningGoalsWeight}%)

Topic: ${topic}
Question: ${question}
Explain with a clear & crisp examples based on learner persona & analogy preference in ${tone}
    `.trim()

	return prompt
}

// Possible outcomes:
// 1. A single dominant persona (e.g., "Analytical Thinker").
// 2. Two equally dominant personas (e.g., "Analytical Thinker" and "Practical Problem Solver").
// 3. Two or more dominant personas with a small difference in scores (e.g., "Analytical Thinker" and "Creative Innovator").
// 4. Multiple moderate scores, indicating a balanced combination of several personas (e.g., "Social Learner", "Reflective Learner", "Detail-Oriented Learner").

export function learningStylePersona(scores) {
	// Set the threshold for determining when the difference between scores is small enough to consider a mixed persona.
	const threshold = 2

	// Sort the scores in descending order.
	const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])

	// Initialize an array to store the top scores.
	const topScores = [sortedScores[0]]

	// Iterate through the sorted scores, starting from the second-highest score.
	for (let i = 1; i < sortedScores.length; i++) {
		// Check if the current score is equal to the top score or if the difference between the top score
		// and the current score is within the threshold. If true, add the current score to the topScores array.
		if (
			sortedScores[i][1] === sortedScores[0][1] ||
			sortedScores[0][1] - sortedScores[i][1] <= threshold
		) {
			topScores.push(sortedScores[i])
		} else {
			// If the current score doesn't meet the conditions, stop the loop as the remaining scores will be even lower.
			break
		}
	}

	return topScores.slice(0, 3)
}
