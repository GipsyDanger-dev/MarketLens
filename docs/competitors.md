# Competitor Intelligence

Sprint 8 reads persisted `CompetitorScore` data rather than recalculating a
second ranking in the UI. The ranking shows each overall score, selected detail
shows stored component scores and explanation, and the comparison table exposes
ratings, review counts, and scores side by side.

Nearby competitors are ordered by Haversine distance within 1 km. A component
at least 67% is presented as a strength; below 34% is a weakness. These labels
describe the score model and are not business guarantees.
