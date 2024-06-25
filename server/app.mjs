import express from "express";
import connectionPool from "./utils/db.mjs";
const app = express();
const port = 4001;

app.use(express.json())

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

app.get('/assignments',async(req,res)=>{
  let result;
  try{
    result = await connectionPool.query('select * from assignments');
  }catch{
    return res.status(500).json(
      { message: "Server could not read assignment because database connection" }
    )
  }
  return res.status(200).json({
    data: result.rows
  })
})

app.get('/assignments/:assignmentId', async (req,res)=>{
  const assignmentId = req.params.assignmentId
  let result;
  try{
    result = await connectionPool.query('select * from assignments where assignments_id=$1'),
    [assignmentId]
  }catch{
    return res.status(500).json({message: "Server could not read assignment because database connection" })
  }
  if(!result.rows[0]){
    return res.status(404).json({ message: "Server could not find a requested assignment" })
  }
  return res.status(200).json({data: result.rows[0]})
})

app.post('/assignments',async(req,res)=>{
  const newAssignments = {
    ...req.body,
    
  }
  if(!newAssignments.title || !newAssignments.content || !newAssignments.category){
    return res.status(400).json({ "message": "Server could not create assignment because there are missing data from client" })
  }
  try{
    await connectionPool.query(`
      insert into assignments (title, content, category)
    values($1, $2, $3)
      `,
      [
        newAssignments.title,
        newAssignments.content,
        newAssignments.category,
      ]);
      return res.status(201).json({message: "Created assignment sucessfully"})
  }catch(error){
      return res.status(500).json({message: "Server could not create assignment because database connection"})
  }
})




app.put('/assignments/:assignmentId',async(req,res)=>{
  const assignmentId = req.params.assignmentId
  const newAssignments = { ...req.body,}
  let result;
  try{
    result =await connectionPool.query(`update assignments
      set title = $2,
          content = $3,
          category = $4
      where assignment_id = $1
      returning *
      `,
      [assignmentId,
        newAssignments.title,
        newAssignments.content,
        newAssignments.category,
      ]);
      if (!result.rows[0]) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }
      return res.status(200).json({
        message: "Updated assignment sucessfully",
      });
      
  }catch(error){
      return res.status(500).json({message: "Server could not update assignment because database connection",})
  }
})
app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  let result;
  try {
    result = await connectionPool.query(
      `
    delete from assignments where assignment_id = $1 returning *
    `,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Server could not find a requested assignment to delete ( assignment id: ${assignmentIdFromClient})`,
    });
  }

  return res.status(200).json({
    message: "Deleted assignment successfully",
  });
});