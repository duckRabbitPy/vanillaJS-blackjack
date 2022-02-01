export default function handler(request, response) {
  const { name } = request.query;
  const db_json = { fhohdsfnajsonf: { score: 5545, username: name } };
  const response = response.json(200).send(db_json);
}
