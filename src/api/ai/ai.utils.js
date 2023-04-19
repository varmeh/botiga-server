function generateWorkExperience(
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
	},
	{
		jobTitleWeight = 2,
		companyWeight = 1,
		industryWeight = 1,
		yearsOfExperienceWeight = 2,
		responsibilitiesWeight = 1,
		areasOfExpertiseWeight = 2,
		skillsWeight = 3,
		certificationsWeight = 2,
		geographicLocationWeight = 2
	}
) {
	const jobTitleStr = jobTitle
		? `I've worked as a ${jobTitle} (Weight: ${jobTitleWeight})`
		: ''
	const companyStr = company ? ` at ${company} (Weight: ${companyWeight})` : ''
	const industryStr = industry
		? `, in the ${industry} industry (Weight: ${industryWeight})`
		: ''
	const yearsOfExperienceStr = yearsOfExperience
		? ` for ${yearsOfExperience} years (Weight: ${yearsOfExperienceWeight})`
		: ''

	const responsibilitiesStr = responsibilities
		? `. My main responsibilities included ${responsibilities} (Weight: ${responsibilitiesWeight})`
		: ''

	const areasOfExpertiseStr = areasOfExpertise
		? `. I have expertise in ${areasOfExpertise} (Weight: ${areasOfExpertiseWeight})`
		: ''

	const skillsStr = skills
		? `. I've developed skills in ${skills} (Weight: ${skillsWeight})`
		: ''

	const certificationsStr = certifications
		? `, and earned certifications like ${certifications} (Weight: ${certificationsWeight})`
		: ''

	const geographicLocationStr = geographicLocation
		? `. I've worked in ${geographicLocation} (Weight: ${geographicLocationWeight})`
		: ''

	return `${jobTitleStr}${companyStr}${industryStr}${yearsOfExperienceStr}${responsibilitiesStr}${areasOfExpertiseStr}${skillsStr}${certificationsStr}${geographicLocationStr}`
}

function generateEducationalBackground(
	{
		degree = '',
		fieldOfStudy = '',
		university = '',
		gpa = '',
		relevantCourses = ''
	},
	{
		degreeWeight = 3,
		fieldOfStudyWeight = 4,
		universityWeight = 2,
		gpaWeight = 1,
		relevantCoursesWeight = 3
	}
) {
	const degreeStr = degree ? `I have a ${degree} (Weight: ${degreeWeight})` : ''
	const fieldOfStudyStr = fieldOfStudy
		? ` in ${fieldOfStudy} (Weight: ${fieldOfStudyWeight})${
				university ? ` from ${university} (Weight: ${universityWeight})` : ''
		  }`
		: ''
	const gpaStr = gpa ? `, with a GPA of ${gpa} (Weight: ${gpaWeight})` : ''
	const relevantCoursesStr = relevantCourses
		? `. I have taken relevant courses such as ${relevantCourses} (Weight: ${relevantCoursesWeight})`
		: ''
	return `${degreeStr}${fieldOfStudyStr}${gpaStr}${relevantCoursesStr}`
}

function generateCulturalBackground(
	{
		ethnicity = '',
		nationality = '',
		language = '',
		religion = '',
		socioeconomicStatus = '',
		educationSystem = ''
	},
	{
		ethnicityWeight = 1,
		nationalityWeight = 1,
		languageWeight = 1,
		religionWeight = 1,
		socioeconomicStatusWeight = 1,
		educationSystemWeight = 1
	}
) {
	const ethnicityStr = ethnicity
		? `I am of ${ethnicity} ethnicity (Weight: ${ethnicityWeight})`
		: ''
	const nationalityStr = nationality
		? `, a ${nationality} national (Weight: ${nationalityWeight})`
		: ''
	const languageStr = language
		? `, and I speak ${language} (Weight: ${languageWeight})`
		: ''
	const religionStr = religion
		? `. My religion is ${religion} (Weight: ${religionWeight})`
		: ''
	const socioeconomicStatusStr = socioeconomicStatus
		? `, and my socioeconomic status is ${socioeconomicStatus} (Weight: ${socioeconomicStatusWeight})`
		: ''
	const educationSystemStr = educationSystem
		? `. I was educated in the ${educationSystem} system (Weight: ${educationSystemWeight})`
		: ''

	return `${ethnicityStr}${nationalityStr}${languageStr}${religionStr}${socioeconomicStatusStr}${educationSystemStr}`
}

function generateAreaOfInterest(
	{
		hobbies = '',
		academicInterests = '',
		professionalInterests = '',
		socialCauses = ''
	},
	{
		hobbiesWeight = 1,
		academicInterestsWeight = 1,
		professionalInterestsWeight = 1,
		socialCausesWeight = 1
	}
) {
	const hobbiesStr = hobbies
		? `My hobbies include ${hobbies} (Weight: ${hobbiesWeight})`
		: ''
	const academicInterestsStr = academicInterests
		? ` and I have academic interests in ${academicInterests} (Weight: ${academicInterestsWeight})`
		: ''
	const professionalInterestsStr = professionalInterests
		? `. Professionally, I'm interested in ${professionalInterests} (Weight: ${professionalInterestsWeight})`
		: ''
	const socialCausesStr = socialCauses
		? `. I'm passionate about social causes such as ${socialCauses} (Weight: ${socialCausesWeight})`
		: ''

	return `${hobbiesStr}${academicInterestsStr}${professionalInterestsStr}${socialCausesStr}`
}

function generatePriorKnowledge(
	{
		basicUnderstanding = '',
		intermediateUnderstanding = '',
		advancedUnderstanding = ''
	},
	{
		basicUnderstandingWeight = 1,
		intermediateUnderstandingWeight = 2,
		advancedUnderstandingWeight = 3
	}
) {
	const basicUnderstandingStr = basicUnderstanding
		? `I have a basic understanding of ${basicUnderstanding} (Weight: ${basicUnderstandingWeight})`
		: ''
	const intermediateUnderstandingStr = intermediateUnderstanding
		? `, intermediate understanding of ${intermediateUnderstanding} (Weight: ${intermediateUnderstandingWeight})`
		: ''
	const advancedUnderstandingStr = advancedUnderstanding
		? `, and advanced understanding of ${advancedUnderstanding} (Weight: ${advancedUnderstandingWeight})`
		: ''

	return `${basicUnderstandingStr}${intermediateUnderstandingStr}${advancedUnderstandingStr}`
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
		languageProficiency,
		learningGoals,
		learningStyle
	} = learnerPersona

	const { topic, question } = queryContext

	const {
		ageWeight = 5,
		workExperienceWeight = 20,
		educationalBackgroundWeight = 20,
		areaOfInterestWeight = 15,
		priorKnowledgeWeight = 10,
		culturalBackgroundWeight = 10,
		languageProficiencyWeight = 5,
		learningGoalsWeight = 10,
		learningStyleWeight = 5
	} = personaWeightage

	const generatedWorkExperience =
		learnerType === 'professional'
			? generateWorkExperience(workExperience)
			: 'No Work Experience'
	const generatedEducationalBackground = generateEducationalBackground(
		educationalBackground
	)
	const generatedAreaOfInterest = generateAreaOfInterest(areaOfInterest)
	const generatedPriorKnowledge = generatePriorKnowledge(priorKnowledge)
	const generatedCulturalBackground =
		generateCulturalBackground(culturalBackground)

	const prompt = `
        Learner information:
        Age: ${age} (Weightage: ${ageWeight}%)
        Educational Background: ${generatedEducationalBackground} (Weightage: ${educationalBackgroundWeight}%)
        Work Experience: ${generatedWorkExperience} (Weightage: ${workExperienceWeight}%)
        Areas of Interest: ${generatedAreaOfInterest} (Weightage: ${areaOfInterestWeight}%)
        Prior Knowledge: ${generatedPriorKnowledge} (Weightage: ${priorKnowledgeWeight}%)
        Cultural Background: ${generatedCulturalBackground} (Weightage: ${culturalBackgroundWeight}%)
        Language Proficiency: ${languageProficiency} (Weightage: ${languageProficiencyWeight}%)
        Learning Goals: ${learningGoals} (Weightage: ${learningGoalsWeight}%)
        Learning Style: ${learningStyle} (Weightage: ${learningStyleWeight}%)

        Topic: ${topic}
        Question: ${question}
    `.trim()

	return prompt
}
