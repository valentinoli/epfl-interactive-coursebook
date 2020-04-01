# Data previews

## Courses

`epfl_courses.json` contains detailed information about every course, with course codes as keys

Preview example:

```
"COM-480": {
  "name": "Data visualization",
  "section": "SC",
  "language": "English",
  "note": "",
  "path": "/coursebook/en/data-visualization-COM-480?cb_cycle=bama_cyclemaster&cb_section=sc_epfl",
  "semester": "Spring",
  "exam_form": "During the semester",
  "credits": "4",
  "lecture": "2 Hour(s) per week x 14 weeks",
  "project": "2 Hour(s) per week x 14 weeks",
  "lecturers": [
    ["Vuillon Laurent Gilles Marie", "http://people.epfl.ch/319954"]
  ],
  "required": [
    "CS-305 Software engineering (BA)",
    "CS-250 Algorithms (BA)",
    "CS-401 Applied data analysis (MA)"
  ],
  "recommended": [
    "EE-558 A Network Tour of Data Science (MA)",
    "CS-486 Human computer interaction (MA)",
    "CS-210 Functional programming (BA)"
  ],
  "concepts": [
    "Being autonomous is a prerequisite, we don't offer office hours and we won't have enough teaching assistants (you've been warned!).",
    "Knowledge of one of the following progrmaming language such as C++, Python, Scala.",
    "Familiarity with web-development (you already have a blog, host a webiste). Experience with HTML5, Javascript is a strong plus for the course."
  ],
  "prereqisite_for": [],
  "in_the_programs": [
    {
      "program": "Communication Systems - master program",
      "semester": "Master semester 2"
    },
    {
      "program": "Communication Systems - master program",
      "semester": "Master semester 4"
    },
    ...
  ],
  "registrations": {
    "2019-2020": {
      "Digital Humanities": {
        "count": "6",
        "level": "master"
      },
      "Electrical and Electronics Engineering": { ... },
      "Computer Science": { ... },
      ...
    },
     "2018-2019": { ... },
     "2017-2018": { ... }
  }
}
```

## Programs

`epfl_programs.json` contains all programs at EPFL and the list of course codes for each program

Preview example:

```
{
	"propedeutics": { ... },
	"bachelor": { ... },
	"master": {
		...
    "Computational Science and Engineering": { ... },
		"Computer Science": {
			"path": "/studyplan/en/master/computer-science",
			"courses": [..., "CS-454", "COM-480", "EE-559", "CS-472", ...]
		},
		...
	},
	"doctoral_school": { ... }
}
```

## Specializations

`epfl_master_specs.json` contains information about specializations of master's programs which offer them. For each program, it lists the specializations for each course and vice versa.

Preview example:

```
{
	"Civil Engineering": { ... },
	...
	"Computer Science": {
		"spec_key": {
			"a": "Computer Engineering-SP",
			"b": "Data Analytics",
			"c": "Foundations of software",
			"d": "Information Security-SP",
			"e": "Networking and Mobility",
			"f": "Signals, Images and Interfaces",
			"g": "Software Systems",
			"h": "Wireless Communications",
			"i": "Computer Science Theory",
			"j": "Internet Information Systems"
		},
		"courses": {
			...
			"CS-423": ["b", "e", "j"],
			"ENG-466": ["a"],
			"COM-502": [],
			"CS-473": ["a"],
			...
		},
		"specs": {
			"a": [..., "ENG-466", "CS-473", ...],
			"b": [..., "CS-423", ...],
			...
		}
	},
	...
}
```
