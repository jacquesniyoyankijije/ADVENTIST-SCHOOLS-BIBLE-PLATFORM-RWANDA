# Role & Permission Matrix

| Role | Main scope | Notes |
|---|---|---|
| Super Administrator | ALL | Full access to every module and permission |
| Head of Union | Union | Authorized union-level reports and communication |
| Head of Field | Field | Authorized field/school summaries |
| Pastor | Pastoral / assigned schools | Communication and permitted resources |
| School Leader | Assigned school | School administration |
| DOS Officer | Assigned school/authorized scope | Academic records and reports |
| Discipline Officer | Assigned school/authorized scope | Discipline records and comments |
| Bursar Officer | Assigned school/authorized scope | Fees, payments, expenses |
| Teacher | Assigned classes/students | Teaching and permitted marks |
| Student | Own profile | Own results + learning resources |
| Parent/Guardian | Linked children | Permitted child information |
| Ordinary User | Public/authorized learning | Bible, lessons, authorized library |

## Permission verbs
- view
- create
- update
- delete
- approve
- export
- communicate
- administer

## Rule
Permissions are enforced in PostgreSQL/RLS and server-side logic. UI hiding is only a convenience and is never a security boundary.
