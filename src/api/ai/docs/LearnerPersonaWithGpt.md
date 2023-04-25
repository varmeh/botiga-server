# Content Perosnalization as per Learner Persona

The idea of this document is to personalize the query response of a learner on the basis of it's persona

## Top Level Fields

Following table contains the list of top fields used for persona development including the initial weightage.

| Parameter                 | Weightage (%) | Description                                                                                                                                                                               |
| ------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Age                       | 5             | The age of the learner can impact the examples and language used, as well as the pace of explanation.                                                                                     |
| Educational Background    | 20            | The learner's educational background helps in determining their level of understanding of the topic and in selecting appropriate examples.                                                |
| Work Experience           | 20            | Work experience provides context on the learner's professional knowledge and skills, which can be used to create relatable examples based on their job role or industry.                  |
| Area of Interest          | 15            | The learner's area of interest can help in choosing examples that are more appealing to them, increasing engagement and understanding.                                                    |
| Prior Knowledge of Topic  | 10            | Understanding the learner's existing knowledge of the topic is crucial for providing explanations at the right level of complexity and building on their existing understanding.          |
| Learning Goals/Objectives | 10            | Knowing the learner's specific goals or objectives helps in tailoring the explanations and examples to meet those goals and ensure that they get the most out of the learning experience. |
| Learning Style Preference | 5             | Some learners might prefer visual, auditory, or kinesthetic learning styles. Taking these preferences into account can improve the effectiveness of the explanations.                     |
| Cultural Background       | 10            | Cultural background encompasses various aspects of a person's upbringing, beliefs, values, and social customs that are influenced by their cultural heritage.                             |
| Language Proficieny       | 5             |                                                                                                                                                                                           |

Please note that these weightages are not fixed and could vary according to different situations and learner profiles.
The goal is to use this information to create explanations that are tailored to the learner's needs and preferences, making it easier for them to understand and apply the concepts.

At the simplest level, this would generate prompt which could be then used to get a personalized response for the learner using OpenAI API's

```javascript
const axios = require('axios')

const openaiApiKey = 'your_api_key_here'
const prompt = `
	Learner information:
	Age: 28 (Weightage: 5%)
	Educational Background: Bachelor's in Computer Science (Weightage: 20%)
	Work Experience: 5 years as a software engineer (Weightage: 25%)
	Areas of Interest: Programming, Web development, Machine learning (Weightage: 15%)
	Prior Knowledge: Basic understanding of machine learning algorithms (Weightage: 20%)
	Learning Goals: To gain a deeper understanding of neural networks (Weightage: 10%)
	Learning Style: Visual (Weightage: 5%)

	Topic: Neural Networks
	Question: How do neural networks learn from data?
`

axios
	.post(
		'https://api.openai.com/v1/engines/davinci-codex/completions',
		{
			prompt: prompt,
			max_tokens: 150,
			n: 1,
			stop: null,
			temperature: 0.5
		},
		{
			headers: {
				Authorization: `Bearer ${openaiApiKey}`,
				'Content-Type': 'application/json'
			}
		}
	)
	.then(response => {
		const answer = response.data.choices[0].text.trim()
		console.log(answer)
	})
	.catch(error => {
		console.error(error)
	})
```

**Does the order of the information in the prompt has any impact on the response created?**

If the information in the prompt is organized in a way that makes it easier for the model to understand the context and the question, the generated response may be more accurate and relevant.

However, the impact of the order of information might not always be significant, especially if the information is clearly presented, and the model can still understand the context accurately.

To maximize the quality of the generated response, it's generally a good idea to:

1. Structure the prompt in a logical order that makes it easy to understand the context and the question. For example, start with the learner persona information, followed by the topic, and finally, the specific question.
2. Make sure that the prompt is clear and concise, with each piece of information being easy to distinguish from the others.
3. Experiment with different prompt structures to see if the order impacts the quality of the response in your specific use case.

Remember that the effectiveness of the prompt structure may vary depending on the specific topic, the question being asked, and the model being used. It is advisable to test and iterate on the prompt structure to achieve the best results for your application.

## SubFields in Top Level Fields

Here we document subfields in top level fields with possible values

### Educational Background

| Subfield (Weightage)       | Description                                            | Example                                        | Complete Educational Background (Combination)                                                                                                                            |
| -------------------------- | ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Degree (40%)               | The level and type of degree(s) earned                 | Bachelor of Science in Computer Science        | Bachelor of Science in Computer Science, Major: Computer Science, University: XYZ University, GPA: 3.5, Relevant Courses: Data Structures, Algorithms, Operating Systems |
| Major/Field of Study (30%) | The primary area of focus within the degree            | Computer Science                               |                                                                                                                                                                          |
| University (10%)           | The institution where the degree was obtained          | XYZ University                                 |                                                                                                                                                                          |
| GPA (10%)                  | The cumulative Grade Point Average (GPA) or equivalent | 3.5                                            |                                                                                                                                                                          |
| Relevant Courses (10%)     | Specific courses related to the topic or field         | Data Structures, Algorithms, Operating Systems |                                                                                                                                                                          |

A table with above subfields examples
| Degree (20%) | Field of Study (20%) | University (10%) | GPA/Percentage (20%) | Relevant Courses (30%) | Complete Educational Background (Combination) |
|---------------------------|----------------------|-------------------|----------------------|------------------------------------------------------|-----------------------------------------------|
| Bachelor of Science | Computer Science | XYZ University | 3.5 (GPA) | Data Structures, Algorithms, Operating Systems | Bachelor of Science in Computer Science from XYZ University, GPA: 3.5, Relevant Courses: Data Structures, Algorithms, Operating Systems |
| Master of Business Administration | Marketing | ABC Business School | 85% | Consumer Behavior, Digital Marketing, Market Research | Master of Business Administration in Marketing from ABC Business School, Percentage: 85%, Relevant Courses: Consumer Behavior, Digital Marketing, Market Research |
| Bachelor of Engineering | Electrical Engineering | LMN Institute of Technology | 7.5 (CGPA) | Circuit Analysis, Control Systems, Power Electronics | Bachelor of Engineering in Electrical Engineering from LMN Institute of Technology, CGPA: 7.5, Relevant Courses: Circuit Analysis, Control Systems, Power Electronics |

In this table, the weightage of relevant courses is increased to 30%, and the weightage of other fields has been adjusted accordingly. The final column combines the information from the other columns to create a complete educational background description for each row.

### Area of Interest

| Subfield (Weightage)         | Description                                                                                            | Examples                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Hobbies (40%)                | Recreational activities or pastimes enjoyed by the learner                                             | Painting, playing guitar, running                                       |
| Academic Interests (30%)     | Subjects or topics the learner is particularly interested in, apart from their major or field of study | Artificial intelligence, economics, renewable energy                    |
| Professional Interests (20%) | Specific areas within the learner's profession that they are keen to explore or develop further        | Data privacy, agile project management, user experience design          |
| Social Causes (10%)          | Causes or issues that the learner is passionate about or involved in                                   | Environmental conservation, mental health awareness, education equality |

### Language Proficiency

| Subfield (Weightage) | Description                                            | Examples                     | Notes                                                                    |
| -------------------- | ------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------ |
| Speaking (25%)       | Ability to speak and communicate in a language         | Conversational, fluent       | Important for oral communication and presentations                       |
| Listening (25%)      | Ability to understand spoken language                  | Intermediate, advanced       | Crucial for comprehending lectures, discussions, and conversations       |
| Reading (25%)        | Ability to read and understand written language        | Proficient, expert           | Essential for understanding texts, articles, and other written materials |
| Writing (25%)        | Ability to write clearly and effectively in a language | Basic, skilled, professional | Important for written communication, such as essays, emails, and reports |

Language proficiency can be measured using various scales, such as the Common European Framework of Reference for Languages (CEFR), which uses a scale from A1 (beginner) to C2 (master). You can adjust the weightages based on the specific needs and context of your learner persona.

### Cultural Background

| Subfield (Weightage)       | Description                                             | Examples                                     | Notes                                                                       |
| -------------------------- | ------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| Ethnicity (20%)            | A person's ethnic background or ancestry                | Hispanic, Asian, African                     | Can influence values, traditions, and perspectives                          |
| Nationality (20%)          | The country where a person holds citizenship            | American, Indian, French                     | Can impact political views, social norms, and language preferences          |
| Language (20%)             | The primary language spoken by a person                 | English, Spanish, Mandarin                   | Influences communication style and language proficiency                     |
| Religion (20%)             | The religious beliefs or faith a person identifies with | Christianity, Islam, Hinduism, Atheism       | Can shape moral values, rituals, and worldviews                             |
| Socioeconomic Status (10%) | The social and economic standing of a person            | Lower-class, middle-class, upper-class       | Affects access to resources, educational opportunities, and social networks |
| Education System (10%)     | The type of education system a person has experienced   | Public school, private school, homeschooling | Impacts learning style, curriculum exposure, and academic expectations      |

The table shows the subfields of cultural background, their suggested weightage, description, and example values. You can adjust the weightages based on the specific needs and context of your learner persona.

### Work Experience

The weightage distribution of the columns in the table depends on the context and the specific needs of the learner persona you're creating. However, here's a suggested weightage distribution based on the importance of each column for generating a relevant and personalized response:

1. Role (25%): The role or job title is important as it indicates the learner's position and responsibilities within the industry.
2. Industry (20%): The industry helps to contextualize the learner's work experience and can affect their knowledge of specific topics.
3. Duration (15%): The duration of work experience can provide an indication of the learner's level of expertise and familiarity with the field.
4. Notable Achievement(s) (10%): Notable achievements can highlight specific skills or accomplishments that are relevant to the topic being discussed.
5. Areas of Expertise (30%): The areas of expertise give a clear indication of the learner's strengths and can help the model generate more accurate and focused responses.

Please note that this weightage distribution is just a suggested starting point. You can adjust these weightages based on the specific context and the information you believe is most important for generating relevant and personalized responses for your learner persona.

| Role                      | Industry     | Duration | Notable Achievement(s)                      | Areas of Expertise       | Complete Work Experience                                                                                                      |
| ------------------------- | ------------ | -------- | ------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Junior Software Developer | Technology   | 2 years  | Implemented a critical feature              | Front-end development    | 2 years as a Junior Software Developer in Technology, Implemented a critical feature, Expertise in Front-end development      |
| Registered Nurse          | Healthcare   | 5 years  | Became a team leader                        | Emergency care           | 5 years as a Registered Nurse in Healthcare, Became a team leader, Expertise in Emergency care                                |
| Project Manager           | Construction | 10 years | Managed the completion of a large project   | Budget management        | 10 years as a Project Manager in Construction, Managed the completion of a large project, Expertise in Budget management      |
| Data Analyst              | Finance      | 3 years  | Improved data processing efficiency by 30%  | Data visualization       | 3 years as a Data Analyst in Finance, Improved data processing efficiency by 30%, Expertise in Data visualization             |
| High School Teacher       | Education    | 7 years  | Developed a successful after-school program | Mathematics teaching     | 7 years as a High School Teacher in Education, Developed a successful after-school program, Expertise in Mathematics teaching |
| Graphic Designer          | Advertising  | 4 years  | Redesigned a major brand's logo             | Logo and branding design | 4 years as a Graphic Designer in Advertising, Redesigned a major brand's logo, Expertise in Logo and branding design          |

there are additional fields you can add to the table to make it more relevant for customization. Some optional fields include:

1. Company/Organization: The specific company or organization where the person gained their work experience can provide context about their exposure to certain practices, tools, or industry standards.
2. Job Level: Indicating whether the person held an entry-level, mid-level, or senior-level position can help clarify their level of responsibility and decision-making authority within their role.
3. Skills: Listing specific skills related to the role, such as programming languages, software tools, or communication abilities, can provide more insight into the person's capabilities.
4. Certifications: Mentioning any relevant professional certifications, such as PMP, CISSP, or AWS Certified Solutions Architect, can highlight additional qualifications and expertise.
5. Industry Awards: If the person has received any industry awards or recognitions, this can emphasize their accomplishments and reputation within their field.
6. Geographic Location: Including the person's work location (e.g., country or region) can provide context about their exposure to specific regulations, cultural practices, or market dynamics.
7. Training Programs: Mentioning any relevant training programs, workshops, or courses completed can indicate a commitment to continuous learning and professional development.

You can add any of these optional fields to the table based on the specific needs and context of your learner persona. Keep in mind that providing clear and relevant information in these fields will help the model generate more accurate and personalized responses.
