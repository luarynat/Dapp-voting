 
 // Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Importar librerias necesarias.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

//importamos el json que contiene el ABI para interactuar con el smart contract
import voting_artifacts from '../../build/contracts/Voting.json'

//convierte el json a una matriz
var Voting = contract(voting_artifacts);

let candidates = {"Maria": "candidate-1", "Nicolas": "candidate-2", "Raul": "candidate-3"}

//funcion para enviar votos
window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();
  try {
    $("#msg").html("El voto ha sido enviado. El conteo de votos aumentará tan pronto como se registre el voto en la cadena de bloques. Por favor espera!!")
    $("#candidate").val("");

    //funcion para debloquear la cuenta que envia transacciones
    web3.personal.unlockAccount('0x88c878978f745204a308289274296297380211e5','ethereum');
    
    // 
    Voting.deployed().then(function(contractInstance) {
      contractInstance.voteForCandidate(candidateName, {gas: 4700000, from: web3.eth.accounts[0]}).then(function() {
        let div_id = candidates[candidateName];
        return contractInstance.totalVotesFor.call(candidateName).then(function(v) {
          $("#" + div_id).html(v.toString());
          $("#msg").html("");
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
}

//al cargar la pagina iniciamo el objeto web3
$(document).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  //inyectar el provedor al objeto web3
  Voting.setProvider(web3.currentProvider);
  

  //recorre el array de candidatos haciendo la consulta de votos por cada candidato
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function(contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function(v) {
        $("#" + candidates[name]).html(v.toString());
      });
    })
  }
});