import { NextPage } from "next";
import { useEffect, useState } from "react"
import { Modal } from "react-bootstrap"
import { executeRequest } from "../services/api";
import { Task } from "../types/Task";
import { Item } from "./Item";
import moment from 'moment';

type ListProps = {
    tasks: Task[]
    getListaFiltrada(): void
}

const List: NextPage<ListProps> = ({tasks, getListaFiltrada}) => {

    // states do modal/form
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [msgErro, setMsgErro] = useState('');
    const [_id, setId] = useState<string | undefined>('');    
    const [name, setName] = useState('');    
    const [finishedPrevisionDate, setFinishedPrevisionDate] = useState('');  
    const [finishedDate, setFinishedDate] = useState('');  
        
    const closeModal = () => {
        setName('');
        setFinishedPrevisionDate('');
        setLoading(false);
        setMsgErro('');
        setShowModal(false);
    }    

    const doUpdate = async() => {
        try {
            setLoading(true);
            setMsgErro('');

            if(!_id) {
                setMsgErro('Favor selecionar a tarefa');
                setLoading(false);
                return;
            }

            if(!name && !finishedPrevisionDate) {
                setMsgErro('Favor informar os dados para cadastro da tarefa');
                setLoading(false);
                return;
            }

            const body  : any = {
                name,
                finishedPrevisionDate
            }

            if(finishedDate){
                body.finishedDate = finishedDate;
            }

            const result = await executeRequest('task?id='+_id, 'PUT', body);
            if(result && result.data) {
                await getListaFiltrada();
                closeModal();
            }
        } catch (e : any) {
            console.log(e);
            if(e?.response?.data?.error) {
                setMsgErro(e?.response?.data?.error);
            } else {
                setMsgErro('Nao foi possivel cadastrar tarefa, tente novamente');
            }
        }

        setLoading(false);
    }

    const doDelete = async() => {
        try {
            setLoading(true);
            setMsgErro('');

            if(!_id) {
                setMsgErro('Favor selecionar a tarefa');
                setLoading(false);
                return;
            }

            const result = await executeRequest('task?id='+_id, 'DELETE');
            await getListaFiltrada();
            closeModal();
        } catch (e : any) {
            console.log(e);
            if(e?.response?.data?.error) {
                setMsgErro(e?.response?.data?.error);
            } else {
                setMsgErro('Nao foi possivel deletar tarefa, tente novamente');
            }
        }

        setLoading(false);
    }

    const setTaskAndShow = (task:Task) => {
        setId(task._id);
        setName(task.name);
        setFinishedPrevisionDate(moment(task.finishedPrevisionDate).format('yyyy-MM-DD'));
        setFinishedDate(task.finishedDate ? moment(task.finishedDate).format('yyyy-MM-DD') : '');
        setShowModal(true);
    }

    return(
        <>
        <div className={'container-list' + (tasks && tasks.length > 0 ? '' : ' vazia')}>
            {tasks && tasks.length > 0
                ?
                    tasks.map(task => <Item task={task} key={task._id} setTaskAndShow={setTaskAndShow}/>)
                :
                    <>
                        <img src="/empty-list.svg" alt="Nenhuma tarefa encontrada"/>
                        <p>Você ainda não possui tarefas cadastradas!</p>
                    </>
            }
        </div>
        <Modal show={showModal}
            onHide={() => closeModal()}
            className="container-modal">
            <Modal.Body>
                <p>Alterar a tarefa</p>
                {msgErro && <p className="error">{msgErro}</p>}
                <input type="text"
                    placeholder="Nome da tarefa"
                    value={name}
                    onChange={e => setName(e.target.value)} />
                <input type="text"
                    placeholder="Data de previsão de conclusão"
                    value={finishedPrevisionDate}
                    onChange={e => setFinishedPrevisionDate(e.target.value)}
                    onFocus={e => e.target.type = "date"}
                    onBlur={e => finishedPrevisionDate ? e.target.type = "date" : e.target.type = "text"} />
                <input type="text"
                    placeholder="Data de conclusão"
                    value={finishedDate}
                    onChange={e => setFinishedDate(e.target.value)}
                    onFocus={e => e.target.type = "date"}
                    onBlur={e => finishedDate ? e.target.type = "date" : e.target.type = "text"} />
            </Modal.Body>
            <Modal.Footer>
                <div className="button col-12">
                    <button
                        onClick={doUpdate}
                        disabled={isLoading}
                    >{isLoading ? "...Enviando dados" : "Atualizar"}</button>
                    <span onClick={doDelete}>Excluir</span>
                </div>
            </Modal.Footer>                
        </Modal>
        </>
    );
}

export { List }