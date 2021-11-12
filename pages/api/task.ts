import type {NextApiRequest, NextApiResponse} from 'next';
import { dbConnect } from '../../middlewares/dbConnect';
import { jwtValidator } from '../../middlewares/jwtValidator';
import { corsPolicy } from '../../middlewares/corsPolicy';
import { TaskModel } from '../../models/TaskModel';
import { DefaultResponse } from '../../types/DefaultResponse';
import { GetTasksRequest } from '../../types/GetTasksRequest';
import { Task } from '../../types/Task';
import { TaskRequest } from '../../types/TaskRequest';
import user from './user';

const handler = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse | Task[]>) => {
    try{
        let userId = req.body?.userId as string;   
        if(!userId){ 
            userId = req.query?.userId as string;    
        }

        switch(req.method){
            case 'POST':
                return await saveTask(req, res, userId);
            case 'PUT':
                return await updateTask(req, res, userId);
            case 'DELETE':
                return await deleteTask(req, res, userId);
            case 'GET':
                return await getTasks(req, res, userId);
            default:
                break;
        }

        return res.status(400).json({ error: 'Metodo informado nao esta disponivel.'});
    }catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Ocorreu erro ao gerenciar tarefas, tente novamente.'});
    }
}

const validateBody = (obj : TaskRequest, userId : string | null | undefined) => {
    if(!obj.name || obj.name.length < 3){
        return 'Nome da tarefa invalido.';    
    }

    if(!userId){
        return 'Usuario nao encontrado.';    
    }

    if(!obj.finishedPrevisionDate){
        return 'Data de previsao nao informada';    
    }
}

const saveTask = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse>, userId : string | null | undefined) => {
    const obj : TaskRequest = req.body;

    const msgValidation = validateBody(obj, userId);
    if(msgValidation){
        return res.status(400).json({ error: msgValidation});
    }

    const task : Task = {
        userId: userId as string,
        name: obj.name,
        finishedPrevisionDate : obj.finishedPrevisionDate
    };

    await TaskModel.create(task);
    return res.status(200).json({ error: 'Tarefa Criada com sucesso.'});    
}

const validateAndReturnTaskFound = async (req : NextApiRequest, userId : string | null | undefined) => {
    const taskId = req.query?.id as string;

    if(!userId){
        return null;
    }

    if(!taskId || taskId.trim() === ''){
        return null;    
    }

    const taskFound = await TaskModel.findById(taskId);
    if(!taskFound || taskFound.userId !== userId){
        return null;    
    }    

    return taskFound;
}

const updateTask = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse>, userId : string | null | undefined) => {
    const obj : Task = req.body;

    const taskFound = await validateAndReturnTaskFound(req, userId);
    if(!taskFound){
        return res.status(400).json({ error: 'Tarefa nao encontrada.'});    
    }

    const msgValidation = validateBody(obj, userId);
    if(msgValidation){
        return res.status(400).json({ error: msgValidation});
    }

    taskFound.name = obj.name;
    taskFound.finishedPrevisionDate = obj.finishedPrevisionDate;
    taskFound.finishedDate = obj.finishedDate;

    await TaskModel.findByIdAndUpdate({ _id : taskFound._id}, taskFound);
    return res.status(200).json({ error: 'Tarefa Alterada com sucesso.'});    
}

const deleteTask = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse>, userId : string | null | undefined) => {

    const taskFound = await validateAndReturnTaskFound(req, userId);
    if(!taskFound){
        return res.status(400).json({ error: 'Tarefa nao encontrada.'});    
    }    

    await TaskModel.findByIdAndDelete({ _id : taskFound._id});
    return res.status(200).json({ error: 'Tarefa deletada com sucesso.'});    
}

const getTasks = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse | Task[]>, userId : string | null | undefined) => {
    const params : GetTasksRequest = req.query;

    const query = {
        userId
    } as any

    if(params?.finishedPrevisionDateStart){
        query.finishedPrevisionDate = { $gte : params?.finishedPrevisionDateStart}
    }

    if(params?.finishedPrevisionDateEnd){
        if(!params?.finishedPrevisionDateStart){
            query.finishedPrevisionDate = {}
        }
        query.finishedPrevisionDate.$lte = params?.finishedPrevisionDateEnd
    }

    if(params?.status){
        const status = parseInt(params.status);
        switch(status){
            case 1 : 
                query.finishedDate = null;
                break;

            case 2 : 
                query.finishedDate = { $ne : null};
                break;
            default : break;
        }
    }

    const result = await TaskModel.find(query) as Task[];
    return res.status(200).json(result);
}

export default corsPolicy(dbConnect(jwtValidator(handler)));