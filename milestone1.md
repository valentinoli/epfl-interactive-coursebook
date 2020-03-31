## Milestone 1
The purpose of this milestone is to set up goals for our final project and assess the feasibility of our ideas. We begin by introducing the dataset we will be working with, the data source, format and features. Next, we frame the general topic of our visualization and discuss the motivation behind the project and its significance to the target audience. We discuss the data pre-processing steps required and display some basic statistics. Finally, we discuss related work, originality and sources of inspiration.

### Dataset
We have at our disposal the set of all EPFL programs, courses and course registrations. We harvested course data from EPFL [studyplans](https://edu.epfl.ch/studyplan/en) and [coursebooks](https://edu.epfl.ch/coursebook/en/data-visualization-COM-480), and course registrations were gathered from the [IS-Academia Reporting portal](https://isa.epfl.ch/imoniteur_ISAP/!gedreports.htm). You are free to [contact us](README.md#project-of-data-visualization-com-480) about any questions and enquiries about the data and the methods used in gathering it.

After some pre-processing steps, the raw data has been thoughtfully transformed into _three_ `.json` files.

[View preview examples](preview.md)

[`epfl_courses.json`](preview.md#courses) contains detailed information about every course, with course codes as keys.
[`epfl_programs.json`](preview.md#programs) contains all programs at EPFL and the list of course codes for each program.
[`epfl_master_specs.json`](preview.md#specializations) contains information about specializations of master's programs which offer them. For each program, it lists the specializations for each course and vice versa.

The goal for the next couple of weeks is to process the fields `required`, `recommended`, `concepts` and `prerequisite_for` in `epfl_courses.json` to discover dependencies between courses and create an adjacency list. This list will be stored in a separate `.json` file.


### Problematic
If you are a student at EPFL, you know that sometimes it can be hard to pick suitable courses for the upcoming semester. If are a teacher at EPFL, you might be familiar with the challenge of understanding what other teachers are teaching your students and how it relates to the content in your course or which courses teach similar or related concepts. You might have browsed through the different study plans and course books and opened multiple tabs on your web browser in order to make sense of the highly interconnected system of knowledge that is being presented in a fragmented way.

In this project, we aim to visualize the courses currently taught at EPFL and the relationships between them. The data will be represented on a graph. The courses themselves will be represented by the nodes of the graph and dependencies between courses as (directed) edges. Different node colors, shapes and sizes will be used to distinguish nodes. We envision both an impressive visualization and a rich interactive tool with options for searching and filtering. The user should be able to filter by level, section, program, specialization, course name or code. This can come in handy in many instances, for example when students want to see only the courses of their own program. When filters are applied, connected nodes that don't fulfill the filter condition are displayed in a neutral color. When hovering over or selecting a node, information is displayed about the course.

We also aim to provide a complementary data summary on a separate page in the form of a data story, with graphs and textual descriptions.

### Exploratory Data Analysis

Pre-processing of the data set you chose:
* Show some basic statistics and get insights about the data

### Related work
* What others have already done with the data?
* Why is your approach original?
* What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
* In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.
