console.log → logger.info
console.error → logger.error
critical crash → logger.fatal

Real Backend Flow
[
{ $match: {} },
{ $lookup: {} },
{ $addFields: {} },
{ $project: {} }
]

// populate in mongidb :ObjectId ko actual document me convert

| Field          | Meaning                            |
| -------------- | ---------------------------------- |
| `from`         | kis collection me jaana hai        |
| `localField`   | current collection ka field        |
| `foreignField` | dusri collection ka matching field |
| `as`           | result kaha store karna hai        |

localField value == foreignField value

/\*
Current Collection
↓
localField value
↓
Go to "from" collection
↓
Find matching foreignField
↓
Store result in "as"

\*/
