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

                web3.eth.sendTransaction({/* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }

        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            web3.eth.sendTransaction({/* ... */ })
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
        const MyData = await $.getJSON('CRUD.json')
        App.contracts.CRUD = TruffleContract(MyData)
        App.contracts.CRUD.setProvider(App.web3Provider)
        App.MyData = await App.contracts.CRUD.deployed()
    },

    store: async () => {
        App.setLoading(true)
        const name = $('#name').val()
        const address = $('#address').val()
        await App.MyData.store(name, address, { from: App.account })
        window.location.reload()
    },

    showEdit: async (e) => {
        const data_id = e
        const shows = App.MyData.show(e).then(function (result) {
            $('#id_edit').val(result[0])
            $('#name_edit').val(result[1])
            $('#address_edit').val(result[2])
            $('#editMoadal').modal('show')
        })
    },

    showDelete: async (e) => {
        const data_id = e
        const shows = App.MyData.show(e).then(function (result) {
            $('#id_delete').val(result[0])
            $('#name_delete').html(result[1])
            $('#deleteMoadal').modal('show')
        })
    },

    update: async (e) => {
        const data_id = $('#id_edit').val()
        const name = $('#name_edit').val()
        const address = $('#address_edit').val()
        App.setLoading(true)
        await App.MyData.update(data_id, name, address, { from: App.account })
        window.location.reload()
    },

    destroy: async (e) => {
        const data_id = $('#id_delete').val()
        App.setLoading(true)
        await App.MyData.destroy(data_id, { from: App.account })
        window.location.reload()
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
        const count = await App.MyData.count()
        const $template = $('.template')
        $('#myDataList').empty()
        for (var i = count; i >= 1; i--) {
            const my_data = await App.MyData.myData(i)
            if (my_data[3] == true) {
                const dataId = my_data[0].toNumber()
                const dataName = my_data[1]
                const dataAddress = my_data[2]
                const $newTemplate = $template.clone()
                $newTemplate.find('.nameData').html(dataName)
                $newTemplate.find('.addressData').html(dataAddress)
                var btn = '<button btn class="btn btn-primary btn-sm" onClick="App.showEdit(' + dataId + ')">Edit</button> <button btn class="btn btn-danger btn-sm" onClick="App.showDelete(' + dataId + ')">Delete</button>';

                $newTemplate.find('.action').append(btn)
                $('#myDataList').append($newTemplate)
                $newTemplate.show()
            }
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