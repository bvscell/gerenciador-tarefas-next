import { NextPage } from "next"
import { Task } from "../types/Task";

type ItemProps = {
    task : Task
    setTaskAndShow(task:Task) : void
}

const Item: NextPage<ItemProps> = ({
    task,
    setTaskAndShow
}) => {

    const getDateText = (finishedDate : any, finishedPrevisionDate : any) => {
        if(finishedDate){
            const fd = new Date(finishedDate)
            return `Concluido em: ${fd.getDate() + '/' + (fd.getMonth()+1) + '/' + fd.getFullYear()}`;
        }

        const fdp = new Date(finishedPrevisionDate)
        return `Previsão de conclusão em: ${fdp.getDate() + '/' + (fdp.getMonth()+1) + '/' + fdp.getFullYear()}`;
    }

    return(
        <div className={"container-item" + (task.finishedDate? '' : ' ativo')}
            onClick={() => task.finishedDate? null : setTaskAndShow(task)}>
            <img src={task.finishedDate? '/checked.svg' : '/not-checked.svg'} 
                alt={task.finishedDate? 'Tarefa concluída' : 'Tarefa em aberto'}/>
            <div>
                <p className={task.finishedDate? 'concluido' : ''}>{task.name}</p>
                <span>{getDateText(task.finishedDate, task.finishedPrevisionDate)}</span>
            </div>
        </div>
    );
}

export { Item }