App = {
    loading: false,
    contracts: {},
  
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },
  
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }

        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
            await ethereum.enable()
            
            web3.eth.sendTransaction({/* ... */})
            } catch (error) {
            // User denied account access...
            }
        }
        
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            web3.eth.sendTransaction({/* ... */})
        }
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },
  
    loadAccount: async () => {
        const accounts = await web3.eth.getAccounts()
        App.account = accounts[0]
    },
  
    loadContract: async () => {
        const todoList = await $.getJSON('ToDoList.json')
        App.contracts.ToDoList = TruffleContract(todoList)
        App.contracts.ToDoList.setProvider(App.web3Provider)
        App.todoList = await App.contracts.ToDoList.deployed()
    },

    createTask: async () => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.todoList.createTask(content, {from:  App.account})
        window.location.reload()
    },

    toggleCompleted: async (e) => {
        if(e.target.checked == true){
            const taskId = e.target.value
            App.setLoading(true)
            await App.todoList.toggleCompleted(taskId, {from:  App.account})
            window.location.reload()
            console.log("Checked")
        } else {
            const taskId = e.target.value
            App.setLoading(true)
            await App.todoList.toggleDecompleted(taskId, {from:  App.account})
            window.location.reload()
            console.log("Checked")
        }
    },
  
    render: async () => {
        if (App.loading) {
            return
        }
        App.setLoading(true)
        $('#account').html("Wallet address: " + App.account)
        await App.renderTasks()
        App.setLoading(false)
    },
    
    renderTasks: async () => {
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')
        for (var i = 1; i <= taskCount; i++) {
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]
    
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                            .prop('value', taskId)
                            .prop('checked', taskCompleted)
                            .on('click', App.toggleCompleted)
    
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }
    
            $newTaskTemplate.show()
        }
    },
    
    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}
  
$(() => {
    $(window).load(() => {
    App.load()
       
    })
})