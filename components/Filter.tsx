import { NextPage } from "next"
import { useState } from "react";

type FilterProps = {
    finishedPrevisionDateStart : string,
    setFinishedPrevisionDateStart(e : string) : void,
    finishedPrevisionDateEnd : string, 
    setFinishedPrevisionDateEnd(e : string) : void,
    status : string,
    setStatus(e : string) : void
}

const Filter: NextPage<FilterProps> = ({
    finishedPrevisionDateStart,
    setFinishedPrevisionDateStart,
    finishedPrevisionDateEnd,
    setFinishedPrevisionDateEnd,
    status,
    setStatus
}) => {

    const [showFilters, setShowFilters] = useState(false);

    return(
        <div className="container-filter">
            <div className="title">
                <span>Tarefas </span>
                <img src="/filtro.svg" alt="Filtrar tarefas" onClick={() => setShowFilters(!showFilters)}/>
                <div className="form">
                    <div>
                        <label>Data prevista de conclusão:</label>
                        <input type="date" value={finishedPrevisionDateStart} onChange={e => setFinishedPrevisionDateStart(e.target.value)}/>
                    </div>
                    <div>
                        <label>até</label>
                        <input type="date" value={finishedPrevisionDateEnd} onChange={e => setFinishedPrevisionDateEnd(e.target.value)}/>
                    </div>
                    <div className="line"/>
                    <div>
                        <label>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value={0}>Todas</option>
                            <option value={1}>Ativas</option>
                            <option value={2}>Concluídas</option>
                        </select>
                    </div>
                </div>
            </div>
            {showFilters && 
                <div className="filtrosMobile">
                    <div>
                        <label>Período de:</label>
                        <input type="date" value={finishedPrevisionDateStart} onChange={e => setFinishedPrevisionDateStart(e.target.value)}/>
                    </div>
                    <div>
                        <label>Período até:</label>
                        <input type="date" value={finishedPrevisionDateEnd} onChange={e => setFinishedPrevisionDateEnd(e.target.value)}/>
                    </div>
                    <div>
                        <label>Status:</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value={0}>Todas</option>
                            <option value={1}>Ativas</option>
                            <option value={2}>Concluídas</option>
                        </select>
                    </div>
                </div>
            }
        </div>
    );
}

export { Filter }