'use strict';
////////////////////////////////////////////////////////////////////////////////////////////////////
// File:    game-of-life.js                                                                       //
// Authors: Konrad Jaworski, Tomasz Witczak                                                       //
////////////////////////////////////////////////////////////////////////////////////////////////////
const e = React.createElement;
///////////////////////////////////////////////////////////////////////////////////////// Cell class
class Cell
    extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = { alive: false };
    }
    render()
    {
        return e(
            "svg",
            {
                width: this.props.size,
                height: this.props.size,
                onMouseDown: (event) => this.handleMouseDrag(event),
                onMouseOver: (event) => this.handleMouseDrag(event)
            },
            e(
                "rect",
                {
                    className: this.state.alive ? 'CellAlive' : 'CellDead',
                    x: 0,
                    y: 0,
                    width: this.props.size,
                    height: this.props.size
                }
            )
        );
    }
    handleMouseDrag(event)
    {
        if(event.buttons === 1)
            this.setState((state) => ({ alive: !state.alive }));
    }
    getStatus()
    {
        return this.state.alive;
    }
    setStatus(alive)
    {
        this.setState((prevState, props) => ({ alive: alive }))
    }
}
//////////////////////////////////////////////////////////////////////////////////////// Board class
class Board
    extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
            {
                cells: Array(this.props.rows * this.props.columns).fill(false)
            };
        this.play = false;
        this.cellStates = Array(this.props.rows * this.props.columns).fill(false);
    }
    performNextGeneration()
    {
        let prevGeneration = Array(this.props.rows * this.props.columns).fill(false);
        for (let i = 0; i < this.props.rows * this.props.columns; i++)
            prevGeneration[i] = this.cellStates[i].getStatus();

        let nextGeneration = Array(prevGeneration.length).fill(false);

        for (let i = 0; i < this.props.rows; i++) {
            for (let j = 0; j < this.props.columns; j++) {
                let neighbours = 0;
                const position = i * this.props.columns + j;

                const iL = (((i - 1) < 0) ? (i - 1 + this.props.rows)    : (i - 1)) % this.props.rows;
                const iM = (((i    ) < 0) ? (i     + this.props.rows)    : (i    )) % this.props.rows;
                const iR = (((i + 1) < 0) ? (i + 1 + this.props.rows)    : (i + 1)) % this.props.rows;
                const jT = (((j - 1) < 0) ? (j - 1 + this.props.columns) : (j - 1)) % this.props.columns;
                const jM = (((j    ) < 0) ? (j     + this.props.columns) : (j    )) % this.props.columns;
                const jB = (((j + 1) < 0) ? (j + 1 + this.props.columns) : (j + 1)) % this.props.columns;

                prevGeneration[iL * this.props.columns + jT] ? neighbours++ : null;
                prevGeneration[iL * this.props.columns + jM] ? neighbours++ : null;
                prevGeneration[iL * this.props.columns + jB] ? neighbours++ : null;
                prevGeneration[iM * this.props.columns + jT] ? neighbours++ : null;
                prevGeneration[iM * this.props.columns + jB] ? neighbours++ : null;
                prevGeneration[iR * this.props.columns + jT] ? neighbours++ : null;
                prevGeneration[iR * this.props.columns + jM] ? neighbours++ : null;
                prevGeneration[iR * this.props.columns + jB] ? neighbours++ : null;

                nextGeneration[position] = false;
                if ((prevGeneration[position] && (neighbours === 2 || neighbours === 3))
                    ||
                    (!prevGeneration[position] && (neighbours === 3))) {
                    nextGeneration[position] = true;
                }

                if(prevGeneration[position] !== nextGeneration[position])
                    this.cellStates[position].setStatus(nextGeneration[position]);
            }
        }
    }
    onKeyDown(event)
    {
        if(event.keyCode === 32)
        {
            event.preventDefault();
            this.setState((prevState, props) => {
                this.play = !this.play;
                return null;
            });
        }
        else if(event.keyCode === 82)
        {
            this.resetBoard();
        }
    }
    resetBoard()
    {
        for(let i = 0; i < this.cellStates.length; i++)
            this.cellStates[i].setStatus(false);
    }
    componentDidMount()
    {
        this.interval = setInterval(() => {
            if(this.play) return this.performNextGeneration();
            }, 100);
    }
    componentWillUnmount()
    {
        clearInterval(this.interval);
    }
    render()
    {
        let board = [];
        for(let i = 0; i < this.props.rows; i++)
        {
            let cellRow = [];
            for(let j = 0; j < this.props.columns; j++)
            {
                cellRow.push(e(
                    Cell,
                    {
                        size: this.props.cellSize,
                        id: i * this.props.columns + j,
                        ref: (cellState) => {
                            this.cellStates[i*this.props.columns + j] = cellState;
                        }
                    }
                ));
            }
            board.push(e(
                "div",
                {
                    className: "CellRow",
                    onKeyDown: (event) => this.onKeyDown(event),
                    tabIndex: "0"
                },
                cellRow
            ));
        }

        return e("div", { id: "Board" }, board);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////// UI class
class UserInterface
    extends React.Component
{
    render()
    {
        return e("div", { id: "UserInterface" }, [e(
            "div",{ id: "MainTitle", className: "centered" }, "Game Of Life"), e(
            "div",{ id: "AdditionalInfo", className: "centered"},
                "Draw cells with [LEFT MOUSE BUTTON] | Press [SPACE] to start/stop simulation " +
                "| Press [R] to reset")]);
    }
}
///////////////////////////////////////////////////////////////////////////////////////// Game class
class GameOfLife
    extends React.Component
{
    render()
    {
        const viewport =
            {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
        const cellsPerRow = 75;
        const cellSize = viewport.width / cellsPerRow;
        const rows = Math.ceil(viewport.height / cellSize);
        const columns = Math.trunc(viewport.width  / cellSize);

        return [
            e(
                Board,
                {
                    cellSize: cellSize,
                    rows: rows,
                    columns: columns
                }
            ),
            e(
                UserInterface,
            )
        ];
    }
}
/////////////////////////////////////////////////////////////////////////////// Main React component
ReactDOM.render(
    e(GameOfLife),
    document.getElementById('root')
);
////////////////////////////////////////////////////////////////////////////////////////////////////