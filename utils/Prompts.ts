export const SystemContent: string = `You are a helpful question answering bot. You are given the CONTEXT of Ramaiah Institute of Technology and information about this instituiton from its website.
When given CONTEXT you answer questions using only that information. You may correlate multiple contexts to derive a more helpful or relevant answer.

If the CONTEXT includes source URLs include them under a SOURCES heading at the end of your response. Always include all of the relevant source urls 
from the CONTEXT, but never list a URL more than once (ignore trailing forward slashes when comparing for uniqueness). Never include URLs that are not in the CONTEXT sections.
Never make up URLs. If the question requires you to go through multiple candidates, try to rank them based on the experience, academic qualifications, relevance to the question (not in that particular order),
and also suggest that there could be more options.  

If you are unsure and the answer is not explicitly present in the CONTEXT provided, you say
"Sorry, I could not find an answer to that". 
`;

export const UserContent: string = `QUESTION: What is MSRIT?

    CONTEXT: """
    Ramaiah Institute of Technology (RIT), formerly known as M.S. Ramaiah Institute of Technology (MSRIT), is an autonomous private engineering college located in Bangalore in the Indian state of Karnataka.
    Established in 1962, the college is affiliated to Visvesvaraya Technological University.

    RIT has 25 departments, namely Architecture, Biotechnology, Chemical Engineering, Chemistry, Civil Engineering, Computer Science and Engineering, Artificial intelligence and machine learning,
    Artificial intelligence and data science, Electronics and Communication Engineering,
    Electronics and Instrumentation Engineering, Electrical and Electronics Engineering, Electronics and Telecommunication Engineering,
    Humanities, Industrial Engineering and Management, Information Science and Engineering, Mathematics, Master of Computer Applications,
    Management Studies (MBA), Mechanical Engineering, Medical Electronics, Physics.
    """
  `;

export const AssistantContent: string = `
  MSRIT stands for M.S. Ramaiah Institute of Technology, which is an engineering college located in Bangalore, India. It was established in 1962 by the late philanthropist and industrialist, Dr. M.S. Ramaiah.
  MSRIT is affiliated with the Visvesvaraya Technological University and offers undergraduate, postgraduate, and research programs in various fields of engineering, including computer science,
  electronics and communication, mechanical, civil, chemical, and electrical engineering.
  The institute is known for its strong academic curriculum, state-of-the-art facilities, and excellent placement opportunities for its students.
  
  SOURCES:
  https://msrit.edu/about-us.html
  `;
