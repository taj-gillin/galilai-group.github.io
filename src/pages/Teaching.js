import "./Teaching.css"

const courses = [
  {
    "id": "CSCI 2952X",
    "name": "Topics in Self-Supervised Learning",
    "years": ["Fall 2024", "Fall 2025"],
    "links": ["", "https://docs.google.com/document/d/1J958C6966RxQ3INqYqmso-cyMfpKnZG25f6COMjj_ac/edit?usp=sharing"]
  },
  {
    "id": "CSCI 2470",
    "name": "Deep Learning",
    "years": ["Spring 2026"],
    "links": [""]
  }
]

const tutorials = [
  {

  }
]

const Teaching = () => {
  return (
      <div className="teaching-container">
        <div className="teaching-listings card-list">
          <ul>
            {courses.map((course, index) => {
              const zippedLinks = course.years.map((a, i) => [a, course.links[i]]);
              
              // Get the most recent link (last non-empty link)
              const latestLink = course.links.filter(link => link).pop() || null;
              const courseTitle = `${course.id}: ${course.name}`;
              
              // Format offered terms with commas
              const offeredTerms = zippedLinks.map((item, idx) => {
                return (
                  <span key={idx}>
                    {item[1] ? (
                      <a href={item[1]} target="_blank" rel="noopener noreferrer">
                        {item[0]}
                      </a>
                    ) : (
                      item[0]
                    )}
                    {idx < zippedLinks.length - 1 && ", "}
                  </span>
                );
              });

              return (
                <li key={index} className="teaching-post">
                  <div className="post-content-wrapper">
                    <h2 className="post-title">
                      {latestLink ? (
                        <a href={latestLink} target="_blank" rel="noopener noreferrer">
                          {courseTitle}
                        </a>
                      ) : (
                        courseTitle
                      )}
                    </h2>
                    <div className="post-meta">
                      <span className="post-updated">{offeredTerms}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
  )
}

export default Teaching;
